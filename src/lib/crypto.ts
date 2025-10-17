export async function encryptString(
  plainText: string,
  passphrase: string,
  iterations = 200_000
): Promise<CryptoPacket> {
  const salt = randBytes(16);
  const iv = randBytes(12);
  const key = await deriveKey(passphrase, salt, iterations);

  const data = enc.encode(plainText);
  const ct = await subtle().encrypt(
    { name: "AES-GCM", iv },
    key,
    data.buffer as ArrayBuffer // ✅ cast till ArrayBuffer
  );

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
  const salt = b64.toBytes(packet.header.salt);
  const iv = b64.toBytes(packet.header.iv);
  const key = await deriveKey(passphrase, salt, packet.header.iterations);

  const ct = b64.toBytes(packet.ciphertext);
  const pt = await subtle().decrypt(
    { name: "AES-GCM", iv },
    key,
    ct.buffer as ArrayBuffer // ✅ cast här också
  );
  return dec.decode(pt);
}

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
      salt: salt.buffer as ArrayBuffer, // ✅ cast igen
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}