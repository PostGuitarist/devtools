export interface PermissionSet {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface ChmodPermissions {
  owner: PermissionSet;
  group: PermissionSet;
  others: PermissionSet;
}

export const CHMOD_PRESETS: { label: string; octal: string }[] = [
  { label: "644 — rw-r--r--", octal: "644" },
  { label: "664 — rw-rw-r--", octal: "664" },
  { label: "666 — rw-rw-rw-", octal: "666" },
  { label: "600 — rw-------", octal: "600" },
  { label: "700 — rwx------", octal: "700" },
  { label: "744 — rwxr--r--", octal: "744" },
  { label: "755 — rwxr-xr-x", octal: "755" },
  { label: "775 — rwxrwxr-x", octal: "775" },
  { label: "777 — rwxrwxrwx", octal: "777" },
];

export function permissionSetToDigit(set: PermissionSet): number {
  return (set.read ? 4 : 0) + (set.write ? 2 : 0) + (set.execute ? 1 : 0);
}

export function digitToPermissionSet(digit: number): PermissionSet {
  return {
    read: (digit & 4) !== 0,
    write: (digit & 2) !== 0,
    execute: (digit & 1) !== 0,
  };
}

export function permissionsToOctal(perms: ChmodPermissions): string {
  return [perms.owner, perms.group, perms.others]
    .map((set) => permissionSetToDigit(set))
    .join("");
}

export function octalToPermissions(octal: string): ChmodPermissions {
  if (!/^[0-7]{3,4}$/.test(octal)) {
    throw new Error("Octal permissions must be 3 or 4 digits, each 0-7.");
  }
  // A leading 4th digit (setuid/setgid/sticky) is accepted but not represented.
  const digits = octal.length === 4 ? octal.slice(1) : octal;
  const [owner, group, others] = Array.from(digits).map((d) => Number(d));
  return {
    owner: digitToPermissionSet(owner),
    group: digitToPermissionSet(group),
    others: digitToPermissionSet(others),
  };
}

export function permissionSetToSymbolic(set: PermissionSet): string {
  return `${set.read ? "r" : "-"}${set.write ? "w" : "-"}${set.execute ? "x" : "-"}`;
}

export function permissionsToSymbolic(perms: ChmodPermissions): string {
  return [perms.owner, perms.group, perms.others]
    .map((set) => permissionSetToSymbolic(set))
    .join("");
}

const SYMBOLIC_RE = /^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/;

export function symbolicToPermissions(symbolic: string): ChmodPermissions {
  if (!SYMBOLIC_RE.test(symbolic)) {
    throw new Error("Symbolic permissions must be 9 characters, e.g. rwxr-xr-x.");
  }
  function parseTriplet(triplet: string): PermissionSet {
    return {
      read: triplet[0] === "r",
      write: triplet[1] === "w",
      execute: triplet[2] === "x",
    };
  }
  return {
    owner: parseTriplet(symbolic.slice(0, 3)),
    group: parseTriplet(symbolic.slice(3, 6)),
    others: parseTriplet(symbolic.slice(6, 9)),
  };
}

export function buildChmodCommand(
  perms: ChmodPermissions,
  target: string,
  recursive: boolean
): string {
  const octal = permissionsToOctal(perms);
  const flag = recursive ? "-R " : "";
  return `chmod ${flag}${octal} ${target.trim() || "<file>"}`;
}
