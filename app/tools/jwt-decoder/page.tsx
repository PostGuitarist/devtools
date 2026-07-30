"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/tools/copy-button";
import { IncomingTransferBanner } from "@/components/tools/incoming-transfer-banner";
import { ToolLayout } from "@/components/tool-layout";
import { useShareableState } from "@/hooks/use-shareable-state";
import {
  decodeJwt,
  getClaimStatus,
  verifyHmacSignature,
  type HmacVerifyResult,
} from "@/lib/jwt";

interface ShareState {
  token: string;
}

export default function JwtDecoderPage() {
  const [token, setToken] = React.useState("");
  const [secret, setSecret] = React.useState("");
  const [verifyResult, setVerifyResult] = React.useState<HmacVerifyResult | null>(null);
  const [verifying, setVerifying] = React.useState(false);

  useShareableState<ShareState>((state) => setToken(state.token));

  const decoded = React.useMemo(() => {
    if (token.trim() === "") return null;
    try {
      return { value: decodeJwt(token), error: null as string | null };
    } catch (err) {
      return { value: null, error: err instanceof Error ? err.message : "Invalid JWT." };
    }
  }, [token]);

  const claims = decoded?.value ? getClaimStatus(decoded.value.payload) : null;

  function handleClear() {
    setToken("");
    setSecret("");
    setVerifyResult(null);
  }

  function handleTokenChange(value: string) {
    setToken(value);
    setVerifyResult(null);
  }

  async function handleVerify() {
    setVerifying(true);
    try {
      const result = await verifyHmacSignature(token, secret);
      setVerifyResult(result);
    } finally {
      setVerifying(false);
    }
  }

  const payloadText = decoded?.value ? JSON.stringify(decoded.value.payload, null, 2) : "";

  return (
    <ToolLayout
      toolId="jwt-decoder"
      title="JWT Decoder"
      description="Decode a JWT's header and payload, and verify HMAC signatures."
      onClear={handleClear}
      onCopy={() => navigator.clipboard.writeText(payloadText)}
      shareState={{ token } satisfies ShareState}
      sendValue={payloadText || undefined}
    >
      <div className="flex flex-1 flex-col gap-6">
        <IncomingTransferBanner toolId="jwt-decoder" onApply={handleTokenChange} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="jwt-input">JWT</Label>
          <Textarea
            id="jwt-input"
            value={token}
            onChange={(event) => handleTokenChange(event.target.value)}
            placeholder="eyJhbGciOi..."
            className="min-h-[100px] font-mono text-sm"
            aria-invalid={decoded?.error ? true : undefined}
          />
        </div>

        {decoded?.error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{decoded.error}</AlertDescription>
          </Alert>
        )}

        {decoded?.value && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <JsonField label="Header" value={decoded.value.header} />
              <JsonField label="Payload" value={decoded.value.payload} />
            </div>

            {claims && (claims.exp || claims.nbf || claims.iat) && (
              <div className="flex flex-wrap gap-2">
                {claims.iat && (
                  <Badge variant="secondary">
                    Issued {claims.iat.date.toLocaleString()}
                  </Badge>
                )}
                {claims.exp && (
                  <Badge variant={claims.exp.expired ? "destructive" : "default"}>
                    {claims.exp.expired ? "Expired" : "Expires"}{" "}
                    {claims.exp.date.toLocaleString()}
                  </Badge>
                )}
                {claims.nbf && (
                  <Badge variant={claims.nbf.notYetValid ? "destructive" : "default"}>
                    {claims.nbf.notYetValid ? "Not yet valid" : "Valid from"}{" "}
                    {claims.nbf.date.toLocaleString()}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label>Signature (base64url)</Label>
              <div className="border-input flex items-center justify-between rounded-md border px-3 py-2">
                <span className="truncate font-mono text-xs">
                  {decoded.value.signatureB64Url}
                </span>
                <CopyButton value={decoded.value.signatureB64Url} label="Copy signature" />
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t pt-4">
              <Label htmlFor="secret-input">
                Verify HMAC signature (HS256/384/512)
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="secret-input"
                  type="password"
                  value={secret}
                  onChange={(event) => {
                    setSecret(event.target.value);
                    setVerifyResult(null);
                  }}
                  placeholder="Shared secret — never leaves your browser"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVerify}
                  disabled={!secret || verifying}
                >
                  {verifying ? "Verifying..." : "Verify"}
                </Button>
              </div>
              {verifyResult && (
                <div>
                  {verifyResult === "valid" && <Badge>Signature valid</Badge>}
                  {verifyResult === "invalid" && (
                    <Badge variant="destructive">Signature invalid</Badge>
                  )}
                  {verifyResult === "unsupported-algorithm" && (
                    <Badge variant="secondary">
                      Verification not supported for this algorithm (only HS256/384/512)
                    </Badge>
                  )}
                  {verifyResult === "malformed" && (
                    <Badge variant="destructive">Malformed token</Badge>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}

function JsonField({ label, value }: { label: string; value: unknown }) {
  const text = JSON.stringify(value, null, 2);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <CopyButton value={text} label={`Copy ${label}`} />
      </div>
      <Textarea readOnly value={text} className="min-h-[200px] font-mono text-sm" />
    </div>
  );
}
