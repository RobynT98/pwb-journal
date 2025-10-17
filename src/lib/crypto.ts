/**
 * AES-GCM + PBKDF2 med Web Crypto.
 * Självbeskrivande paket → lätt att byta backend senare (t.ex. Tauri/Rust).
 */

export type CryptoPacket = {
  header: {
    v: 1;
    algo: "AES-GCM";
    kdf: "PBKDF2";
    iterations: number;
    salt: string; // base64
    iv: string;   // base64 (12 bytes rekommenderat för GCM)
  };
  ciphertext: string; // base64
};

const enc = new TextEncoder();
const dec = new TextDecoder();

/* ---------- Publikt API ---------- */

export async function encryptString(
  plainText: string,
  passphrase: string,
  iterations = 200_000
): Promise<CryptoPacket> {
  const salt = randBytes(16);
  const iv = randBytes(12);
  const key = await deriveKey(passphrase, salt, iterations);

  const data = enc.encode(plainText); // Uint8Array
  const ct = await subtle().encrypt({ name: "AES-GCM", iv }, key, data);

  return {
    header: {
      v: 1,
      algo: "AES-GCM",
      kdf: "PBKDF2",
      iterations,
      salt: b64.fromBytes(salt),
      iv: b64.fromBytes(iv),
    },
    ciphertext: b64.fromBytes(new Uint8Array(ct)),
  };
}

export async function decryptString(packet: CryptoPacket, passphrase: string): Promise<string> {
  if (packet.header.algo !== "AES-GCM" || packet.header.kdf !== "PBKDF2") {
    throw new Error("Stöds ej: fel algo/kdf i paket.");
  }
  const salt = b64.toBytes(packet.header.salt);
  const iv = b64.toBytes(packet.header.iv);
  const key = await deriveKey(passphrase, salt, packet.header.iterations);

  const ct = b64.toBytes(packet.ciphertext); // Uint8Array
  const pt = await subtle().decrypt({ name: "AES-GCM", iv }, key, ct);
  return dec.decode(pt);
}

export async function verifyPassphrase(packet: CryptoPacket, passphrase: string) {
  try {
    await decryptString(packet, passphrase);
    return true;
  } catch {
    return false;
  }
}

/* ---------- Interna helpers ---------- */

async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const keyMaterial = await subtle().importKey(
    "raw",
    enc.encode(passphrase), // Uint8Array
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return subtle().deriveKey(
    {
      name: "PBKDF2",
      salt, // Uint8Array OK som BufferSource
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function subtle(): SubtleCrypto {
  const api = globalThis?.crypto?.subtle;
  if (!api) throw new Error("Web Crypto API saknas (crypto.subtle).");
  return api;
}

function randBytes(n: number): Uint8Array {
  const a = new Uint8Array(n);
  if (!globalThis.crypto?.getRandomValues) throw new Error("Saknar crypto.getRandomValues.");
  globalThis.crypto.getRandomValues(a);
  return a;
}

/* ---------- Base64 helpers ---------- */

const b64 = {
  fromBytes(bytes: Uint8Array): string {
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return globalThis.btoa(s);
  },
  toBytes(b64str: string): Uint8Array {
    const bin = globalThis.atob(b64str);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  },
};