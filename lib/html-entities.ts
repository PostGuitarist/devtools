export function encodeHtmlEntities(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function decodeHtmlEntities(input: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = input;
  return el.value;
}
