/**
 * Encodes arbitrary tool state as a base64url string suitable for a URL hash
 * fragment, so a tool's input can be shared via link with no backend.
 */
export function encodeStateToParam(state: unknown): string {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeStateFromParam<T = unknown>(param: string): T {
  const base64 = param.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as T;
}

/** Soft warning threshold; most URL bars/servers comfortably handle much more. */
export const SHARE_URL_LENGTH_WARNING = 1800;
