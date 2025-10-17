/**
 * crypto.ts — enkel, modern krypterings-stub för webben
 * Mål: ge en stabil API-yta nu (web crypto), så vi senare kan byta backend (Tauri)
 * utan att ändra anropspunkterna i UI:t.
 *
 * 🌱 Status: PRODUKTIONSBAR i webbläsare (AES-GCM + PBKDF2). Ingen fil-I/O här.
 *
 * Exempel:
 *   const pkt = await encryptString("hemlis", "min-lösenfras");
 *   const klartext = await decryptString(pkt, "min-lösenfras");
 */

export type CryptoPacket = {
  header: {
    v: 1;
    algo: "AES-GCM";
    kdf: "PBKDF2";
    iterations: number;     // t.ex. 200000 (balans CPU/säkerhet)
    salt: string;           // base64
    iv: string;             // base64
  };
  ciphertext: string;       // base64 (AES-GCM)
};

// ---------- Publikt API ----------

/** Kryptera en UTF-8-sträng med lösenfras. Returnerar ett självbeskrivande paket. */
export async function encryptString(plainText: string, passphrase: string, iterations = 200_000): Promise<CryptoPacket> {
  const salt = randBytes(16);
  const iv = randBytes(12); // 96-bit IV rekommenderas för GCM
  const key = await deriveKey(passphrase, salt, iterations);

  const data = enc.encode(plainText);
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

/** Dekryptera ett CryptoPacket med rätt lösenfras. Kastar på fel lösen/korrupt data. */
export async function decryptString(packet: CryptoPacket, passphrase: string): Promise<string> {
  if (packet.header.algo !== "AES-GCM" || packet.header.kdf !== "PBKDF2") {
    throw new Error("Stöds ej: paketets header saknar rätt algoritmer.");
  }
  const salt = b64.toBytes(packet.header.salt);
  const iv = b64.toBytes(packet.header.iv);
  const key = await deriveKey(passphrase, salt, packet.header.iterations);

  const ct = b64.toBytes(packet.ciphertext);
  const pt = await subtle().decrypt({ name: "AES-GCM", iv }, key, ct);

  return dec.decode(pt);
}

/** Snabb validering: försöker dekryptera utan att läsa resultat (true/false). */
export async function verifyPassphrase(packet: CryptoPacket, passphrase: string): Promise<boolean> {
  try {
    await decryptString(packet, passphrase);
    return true;
  } catch {
    return false;
  }
}

// ---------- Interna helpers (Web Crypto) ----------

async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const keyMaterial = await subtle().importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return subtle().deriveKey(
    {
      name: "PBKDF2",
      salt,
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
  if (typeof globalThis !== "undefined" && "crypto" in globalThis && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error("Web Crypto API saknas (crypto.subtle). Kör i en modern webbläsare.");
}

function randBytes(n: number): Uint8Array {
  const a = new Uint8Array(n);
  if (!globalThis.crypto?.getRandomValues) throw new Error("Saknar säkert RNG (crypto.getRandomValues).");
  globalThis.crypto.getRandomValues(a);
  return a;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

// ---------- Base64 helpers (binär-safe) ----------

const b64 = {
  fromBytes(bytes: Uint8Array): string {
    // Gör om till binärsträng och btoa
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

// ---------- Framtida Tauri-växling (design-anteckning) ----------
/**
 * När vi byter till Tauri/RS:
 *  - Låt denna fil exportera samma API (encryptString/decryptString/verifyPassphrase).
 *  - Internt byter vi implementeringen till ett Tauri-kommando (Rust AES-GCM + Argon2).
 *  - Headern kan få { kdf: "Argon2id", algo: "XChaCha20-Poly1305" } utan att UI:t påverkas.
 */