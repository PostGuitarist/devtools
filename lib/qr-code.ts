import QRCode from "qrcode";

export type QrErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QrOptions {
  errorCorrectionLevel?: QrErrorCorrectionLevel;
  margin?: number;
  width?: number;
  colorDark?: string;
  colorLight?: string;
}

function resolveOptions(options: QrOptions) {
  return {
    errorCorrectionLevel: options.errorCorrectionLevel ?? "M",
    margin: options.margin ?? 2,
    width: options.width ?? 300,
    color: {
      dark: options.colorDark ?? "#000000",
      light: options.colorLight ?? "#ffffff",
    },
  };
}

export function generateQrSvg(text: string, options: QrOptions = {}): Promise<string> {
  if (text === "") return Promise.reject(new Error("Enter some text to encode."));
  return QRCode.toString(text, { type: "svg", ...resolveOptions(options) });
}

export interface WifiPayloadOptions {
  ssid: string;
  password: string;
  encryption?: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
}

function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function buildWifiPayload(options: WifiPayloadOptions): string {
  const { ssid, password, encryption = "WPA", hidden = false } = options;
  const passwordField = encryption === "nopass" ? "" : escapeWifiField(password);
  return `WIFI:T:${encryption};S:${escapeWifiField(ssid)};P:${passwordField};H:${hidden ? "true" : "false"};;`;
}

export interface EmailPayloadOptions {
  to: string;
  subject?: string;
  body?: string;
}

export function buildEmailPayload(options: EmailPayloadOptions): string {
  const params = new URLSearchParams();
  if (options.subject) params.set("subject", options.subject);
  if (options.body) params.set("body", options.body);
  const query = params.toString();
  return `mailto:${options.to}${query ? `?${query}` : ""}`;
}
