"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Download, TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import {
  buildEmailPayload,
  buildWifiPayload,
  generateQrSvg,
  type QrErrorCorrectionLevel,
} from "@/lib/qr-code";

type Mode = "text" | "wifi" | "email";

interface ShareState {
  mode: Mode;
  text: string;
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  errorCorrectionLevel: QrErrorCorrectionLevel;
  size: number;
  colorDark: string;
  colorLight: string;
}

export default function QrCodeGeneratorClient() {
  const [mode, setMode] = React.useState<Mode>("text");
  const [text, setText] = React.useState("https://devtools.example.com");
  const [ssid, setSsid] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [encryption, setEncryption] = React.useState<"WPA" | "WEP" | "nopass">("WPA");
  const [emailTo, setEmailTo] = React.useState("");
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailBody, setEmailBody] = React.useState("");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = React.useState<QrErrorCorrectionLevel>("M");
  const [size, setSize] = React.useState(300);
  const [colorDark, setColorDark] = React.useState("#000000");
  const [colorLight, setColorLight] = React.useState("#ffffff");
  const [svg, setSvg] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  useShareableState<ShareState>((state) => {
    setMode(state.mode);
    setText(state.text);
    setSsid(state.ssid);
    setPassword(state.password);
    setEncryption(state.encryption);
    setEmailTo(state.emailTo);
    setEmailSubject(state.emailSubject);
    setEmailBody(state.emailBody);
    setErrorCorrectionLevel(state.errorCorrectionLevel);
    setSize(state.size);
    setColorDark(state.colorDark);
    setColorLight(state.colorLight);
  });

  const payload =
    mode === "wifi"
      ? buildWifiPayload({ ssid, password, encryption })
      : mode === "email"
        ? buildEmailPayload({ to: emailTo, subject: emailSubject, body: emailBody })
        : text;

  const qrOptions = React.useMemo(
    () => ({ errorCorrectionLevel, width: size, colorDark, colorLight }),
    [errorCorrectionLevel, size, colorDark, colorLight]
  );

  React.useEffect(() => {
    let cancelled = false;
    generateQrSvg(payload, qrOptions)
      .then((result) => {
        if (!cancelled) {
          setSvg(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSvg("");
          setError(err instanceof Error ? err.message : "Could not generate QR code");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [payload, qrOptions]);

  async function downloadPng() {
    if (!payload) return;
    const dataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel,
      width: size,
      margin: 2,
      color: { dark: colorDark, light: colorLight },
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qr-code.png";
    link.click();
  }

  function downloadSvg() {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolLayout
      toolId="qr-code-generator"
      title="QR Code Generator"
      description="Create QR codes for text, URLs, email, WiFi, phone. Custom colors. Download PNG/SVG."
      sendValue={payload}
      shareState={
        {
          mode,
          text,
          ssid,
          password,
          encryption,
          emailTo,
          emailSubject,
          emailBody,
          errorCorrectionLevel,
          size,
          colorDark,
          colorLight,
        } satisfies ShareState
      }
    >
      <div className="flex flex-1 flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <IncomingTransferBanner
            toolId="qr-code-generator"
            onApply={(value) => {
              setMode("text");
              setText(value);
            }}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="qr-mode">Type</Label>
            <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
              <SelectTrigger id="qr-mode" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text / URL</SelectItem>
                <SelectItem value="wifi">WiFi</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "text" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="qr-text">Text or URL</Label>
              <Input
                id="qr-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="https://example.com"
              />
            </div>
          )}

          {mode === "wifi" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="qr-wifi-ssid">Network name (SSID)</Label>
                <Input id="qr-wifi-ssid" value={ssid} onChange={(e) => setSsid(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="qr-wifi-password">Password</Label>
                <Input
                  id="qr-wifi-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={encryption === "nopass"}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="qr-wifi-encryption">Encryption</Label>
                <Select
                  value={encryption}
                  onValueChange={(value) => setEncryption(value as typeof encryption)}
                >
                  <SelectTrigger id="qr-wifi-encryption">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                    <SelectItem value="WEP">WEP</SelectItem>
                    <SelectItem value="nopass">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {mode === "email" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="qr-email-to">To</Label>
                <Input
                  id="qr-email-to"
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="someone@example.com"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="qr-email-subject">Subject</Label>
                  <Input
                    id="qr-email-subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="qr-email-body">Body</Label>
                  <Input
                    id="qr-email-body"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Size: {size}px</Label>
            <Slider
              aria-label="Size"
              min={128}
              max={600}
              step={8}
              value={[size]}
              onValueChange={([value]) => setSize(value)}
              className="max-w-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:w-64">
            <div className="flex flex-col gap-2">
              <Label htmlFor="qr-color-dark">Foreground</Label>
              <input
                id="qr-color-dark"
                type="color"
                value={colorDark}
                onChange={(event) => setColorDark(event.target.value)}
                className="border-input h-9 w-full rounded-md border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="qr-color-light">Background</Label>
              <input
                id="qr-color-light"
                type="color"
                value={colorLight}
                onChange={(event) => setColorLight(event.target.value)}
                className="border-input h-9 w-full rounded-md border"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:w-48">
            <Label htmlFor="qr-ecl">Error correction</Label>
            <Select
              value={errorCorrectionLevel}
              onValueChange={(value) => setErrorCorrectionLevel(value as QrErrorCorrectionLevel)}
            >
              <SelectTrigger id="qr-ecl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (L)</SelectItem>
                <SelectItem value="M">Medium (M)</SelectItem>
                <SelectItem value="Q">Quartile (Q)</SelectItem>
                <SelectItem value="H">High (H)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-md border p-6">
          {error ? (
            <Alert variant="destructive" className="max-w-sm">
              <TriangleAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div
              className="rounded-md bg-white p-4"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadPng} disabled={!svg}>
              <Download />
              PNG
            </Button>
            <Button variant="outline" size="sm" onClick={downloadSvg} disabled={!svg}>
              <Download />
              SVG
            </Button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
