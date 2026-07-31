"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import {
  HMAC_ALGORITHM_NAMES,
  readHeaderAlgorithm,
  setHeaderAlgorithm,
  setPayloadClaim,
  signJwt,
  type HmacAlgorithm,
} from "@/lib/jwt";

const DEFAULT_HEADER = JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2);
const DEFAULT_PAYLOAD = JSON.stringify(
  { sub: "1234567890", name: "John Doe", iat: 1516239022 },
  null,
  2
);

const EXPIRY_PRESETS = [
  { label: "+1 hour", seconds: 60 * 60 },
  { label: "+1 day", seconds: 60 * 60 * 24 },
  { label: "+30 days", seconds: 60 * 60 * 24 * 30 },
];

interface ShareState {
  header: string;
  payload: string;
}

export default function JwtEncoderClient() {
  const [header, setHeader] = React.useState(DEFAULT_HEADER);
  const [payload, setPayload] = React.useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = React.useState("your-256-bit-secret");
  const [token, setToken] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  useShareableState<ShareState>((state) => {
    setHeader(state.header);
    setPayload(state.payload);
  });

  // Signing is async (WebCrypto), so the token trails the inputs by a tick.
  React.useEffect(() => {
    let cancelled = false;

    signJwt(header, payload, secret)
      .then((signed) => {
        if (cancelled) return;
        setToken(signed);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setToken("");
        setError(err instanceof Error ? err.message : "Could not sign the token.");
      });

    return () => {
      cancelled = true;
    };
  }, [header, payload, secret]);

  const algorithm = readHeaderAlgorithm(header);

  function handleAlgorithmChange(value: string) {
    try {
      setHeader(setHeaderAlgorithm(header, value as HmacAlgorithm));
    } catch {
      setHeader(JSON.stringify({ alg: value, typ: "JWT" }, null, 2));
    }
  }

  function applyClaim(key: string, value: unknown) {
    try {
      setPayload(setPayloadClaim(payload, key, value));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the payload.");
    }
  }

  const nowSeconds = () => Math.floor(Date.now() / 1000);
  const parts = token.split(".");

  return (
    <ToolLayout
      toolId="jwt-encoder"
      title="JWT Encoder"
      description="Build and sign a JWT from a header and payload."
      onClear={() => {
        setHeader(DEFAULT_HEADER);
        setPayload("{}");
        setSecret("");
      }}
      onCopy={() => navigator.clipboard.writeText(token)}
      shareState={{ header, payload } satisfies ShareState}
      sendValue={token}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner toolId="jwt-encoder" onApply={setPayload} />

        <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-col gap-2">
                <Label htmlFor="jwt-algorithm">Algorithm</Label>
                <Select value={algorithm ?? undefined} onValueChange={handleAlgorithmChange}>
                  <SelectTrigger id="jwt-algorithm" className="w-32">
                    <SelectValue placeholder="Custom" />
                  </SelectTrigger>
                  <SelectContent>
                    {HMAC_ALGORITHM_NAMES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="jwt-secret">Signing secret</Label>
                <Input
                  id="jwt-secret"
                  type="password"
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                  placeholder="Shared secret — never leaves your browser"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="jwt-header">Header</Label>
              <Textarea
                id="jwt-header"
                value={header}
                onChange={(event) => setHeader(event.target.value)}
                className="min-h-[110px] font-mono text-sm"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="jwt-payload">Payload</Label>
              <Textarea
                id="jwt-payload"
                value={payload}
                onChange={(event) => setPayload(event.target.value)}
                className="min-h-[240px] font-mono text-sm"
                spellCheck={false}
              />
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-muted-foreground text-xs">Quick claims:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyClaim("iat", nowSeconds())}
                >
                  iat now
                </Button>
                {EXPIRY_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => applyClaim("exp", nowSeconds() + preset.seconds)}
                  >
                    exp {preset.label}
                  </Button>
                ))}
                <Button variant="ghost" size="sm" onClick={() => applyClaim("exp", undefined)}>
                  Remove exp
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            {error && (
              <Alert variant="destructive">
                <TriangleAlert />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="jwt-token">Signed token</Label>
                <CopyButton value={token} label="Copy token" />
              </div>
              <Textarea
                id="jwt-token"
                readOnly
                value={token}
                placeholder="A signed token appears here once the header, payload, and secret are valid."
                className="min-h-[160px] font-mono text-sm break-all"
              />
            </div>

            {parts.length === 3 && (
              <div className="flex flex-col gap-2">
                <Label>Token parts</Label>
                <dl className="divide-y rounded-md border text-sm">
                  {[
                    { name: "Header", value: parts[0] },
                    { name: "Payload", value: parts[1] },
                    { name: "Signature", value: parts[2] },
                  ].map((part) => (
                    <div key={part.name} className="flex items-center gap-3 px-3 py-2">
                      <dt className="text-muted-foreground w-20 shrink-0 text-xs">{part.name}</dt>
                      <dd className="truncate font-mono text-xs">{part.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <p className="text-muted-foreground text-xs">
              Signing runs entirely in your browser with the Web Crypto API. HS256, HS384, and
              HS512 are supported; RS/ES/PS algorithms need a private key and are out of scope.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
