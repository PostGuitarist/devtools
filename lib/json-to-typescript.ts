export interface JsonToTsOptions {
  rootName?: string;
  useInterface?: boolean;
}

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

function isPlainObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toPascalCase(name: string): string {
  const cleaned = name
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  if (cleaned === "") return "Object";
  return /^[0-9]/.test(cleaned) ? `_${cleaned}` : cleaned;
}

function singularize(name: string): string {
  if (name.endsWith("ies")) return `${name.slice(0, -3)}y`;
  if (name.endsWith("ses")) return name.slice(0, -2);
  if (name.endsWith("s") && !name.endsWith("ss")) return name.slice(0, -1);
  return name;
}

function itemNameFor(hintName: string): string {
  const singular = singularize(hintName);
  return singular !== hintName ? singular : `${hintName}Item`;
}

interface CollectedType {
  name: string;
  lines: string[];
}

export function jsonToTypeScript(jsonText: string, options: JsonToTsOptions = {}): string {
  const useInterface = options.useInterface ?? true;
  const rootName = toPascalCase(options.rootName?.trim() || "Root");

  let root: JsonValue;
  try {
    root = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Invalid JSON");
  }

  const collected: CollectedType[] = [];
  const usedNames = new Set<string>();

  function reserveName(base: string): string {
    let candidate = base;
    let suffix = 2;
    while (usedNames.has(candidate)) {
      candidate = `${base}${suffix}`;
      suffix += 1;
    }
    usedNames.add(candidate);
    return candidate;
  }

  function mergeShapes(objects: { [key: string]: JsonValue }[]): {
    sample: { [key: string]: JsonValue };
    optional: Set<string>;
  } {
    const keys: string[] = [];
    const sample: { [key: string]: JsonValue } = {};
    const occurrences = new Map<string, number>();

    for (const obj of objects) {
      for (const key of Object.keys(obj)) {
        if (!(key in sample)) {
          keys.push(key);
          sample[key] = obj[key];
        } else if (sample[key] === null && obj[key] !== null) {
          sample[key] = obj[key];
        }
        occurrences.set(key, (occurrences.get(key) ?? 0) + 1);
      }
    }

    const optional = new Set<string>();
    for (const key of keys) {
      if ((occurrences.get(key) ?? 0) < objects.length) optional.add(key);
    }
    return { sample, optional };
  }

  function emitObjectType(
    obj: { [key: string]: JsonValue },
    hintName: string,
    optionalKeys: Set<string> = new Set()
  ): string {
    const name = reserveName(toPascalCase(hintName));
    const lines = Object.keys(obj).map((key) => {
      const propType = resolveType(obj[key], key);
      const optionalMark = optionalKeys.has(key) ? "?" : "";
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
      return `  ${safeKey}${optionalMark}: ${propType};`;
    });
    collected.push({ name, lines });
    return name;
  }

  function resolveArrayType(items: JsonValue[], hintName: string): string {
    if (items.length === 0) return "unknown[]";

    const objectItems = items.filter(isPlainObject);
    const otherItems = items.filter((item) => !isPlainObject(item));

    const memberTypes = new Set<string>();
    if (objectItems.length > 0) {
      const { sample, optional } = mergeShapes(objectItems);
      memberTypes.add(emitObjectType(sample, itemNameFor(hintName), optional));
    }
    for (const item of otherItems) {
      memberTypes.add(resolveType(item, hintName));
    }

    const union = Array.from(memberTypes);
    const elementType = union.length === 1 ? union[0] : `(${union.join(" | ")})`;
    return `${elementType}[]`;
  }

  function resolveType(value: JsonValue, hintName: string): string {
    if (value === null) return "null";
    if (Array.isArray(value)) return resolveArrayType(value, hintName);
    if (isPlainObject(value)) return emitObjectType(value, hintName);
    return typeof value;
  }

  const rootType = resolveType(root, rootName);

  const rendered = collected
    .map(({ name, lines }) =>
      useInterface
        ? `interface ${name} {\n${lines.join("\n")}\n}`
        : `type ${name} = {\n${lines.join("\n")}\n};`
    )
    .join("\n\n");

  // A plain object root is already represented by the `rootName` interface
  // emitted above; anything else (array/primitive root) needs an explicit
  // top-level alias so the output has a named entry point.
  if (isPlainObject(root)) {
    return `${rendered}\n`;
  }

  const rootAlias = `type ${rootName} = ${rootType};`;
  return rendered === "" ? `${rootAlias}\n` : `${rendered}\n\n${rootAlias}\n`;
}
