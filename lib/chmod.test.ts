import { describe, expect, it } from "vitest";
import {
  buildChmodCommand,
  digitToPermissionSet,
  octalToPermissions,
  permissionSetToDigit,
  permissionsToOctal,
  permissionsToSymbolic,
  symbolicToPermissions,
} from "./chmod";

describe("permissionSetToDigit / digitToPermissionSet", () => {
  it("converts a full permission set to 7", () => {
    expect(permissionSetToDigit({ read: true, write: true, execute: true })).toBe(7);
  });

  it("round-trips every digit 0-7", () => {
    for (let digit = 0; digit <= 7; digit++) {
      expect(permissionSetToDigit(digitToPermissionSet(digit))).toBe(digit);
    }
  });
});

describe("octalToPermissions / permissionsToOctal", () => {
  it("parses 755 into rwxr-xr-x", () => {
    const perms = octalToPermissions("755");
    expect(permissionsToSymbolic(perms)).toBe("rwxr-xr-x");
  });

  it("round-trips through permissionsToOctal", () => {
    expect(permissionsToOctal(octalToPermissions("644"))).toBe("644");
  });

  it("accepts a 4-digit octal by dropping the special-bits digit", () => {
    expect(permissionsToOctal(octalToPermissions("0644"))).toBe("644");
  });

  it("throws on invalid octal", () => {
    expect(() => octalToPermissions("888")).toThrow();
    expect(() => octalToPermissions("12")).toThrow();
  });
});

describe("symbolicToPermissions", () => {
  it("parses rwxr-xr-x", () => {
    const perms = symbolicToPermissions("rwxr-xr-x");
    expect(permissionsToOctal(perms)).toBe("755");
  });

  it("throws on invalid symbolic strings", () => {
    expect(() => symbolicToPermissions("rwx")).toThrow();
    expect(() => symbolicToPermissions("rwxrwxrwz")).toThrow();
  });
});

describe("buildChmodCommand", () => {
  it("builds a basic chmod command", () => {
    const perms = octalToPermissions("644");
    expect(buildChmodCommand(perms, "file.txt", false)).toBe("chmod 644 file.txt");
  });

  it("adds the -R flag when recursive", () => {
    const perms = octalToPermissions("755");
    expect(buildChmodCommand(perms, "dir/", true)).toBe("chmod -R 755 dir/");
  });

  it("falls back to a placeholder target", () => {
    const perms = octalToPermissions("600");
    expect(buildChmodCommand(perms, "", false)).toBe("chmod 600 <file>");
  });
});
