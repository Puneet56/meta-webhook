export async function verifySignature(
  rawBody: string,
  signature: string,
  appSecret: string
): Promise<boolean> {
  // Meta sends: sha256=<hex_digest>
  const [algo, hash] = signature.split("=");
  if (algo !== "sha256" || !hash) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody)
  );

  const expected = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison
  if (expected.length !== hash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return mismatch === 0;
}
