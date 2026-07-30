import { load, dump } from "js-yaml";

export function yamlToJson(yamlText: string): string {
  if (yamlText.trim() === "") return "null";

  let value: unknown;
  try {
    value = load(yamlText);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Invalid YAML");
  }
  return JSON.stringify(value ?? null, null, 2);
}

export function jsonToYaml(jsonText: string): string {
  let value: unknown;
  try {
    value = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Invalid JSON");
  }
  return dump(value, { indent: 2, lineWidth: -1 });
}
