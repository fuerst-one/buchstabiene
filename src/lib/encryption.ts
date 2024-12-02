export type EncryptedData = {
  encryptedData: string;
  initVector: string;
};

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY!;

const encryptData = async (
  plainData: string,
  encryptionKey: string,
): Promise<EncryptedData> => {
  // Generate a random 96-bit initialization vector (IV)
  const initVector = crypto.getRandomValues(new Uint8Array(12));

  // Encode the data to be encrypted
  const encodedData = new TextEncoder().encode(plainData);

  // Prepare the encryption key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(encryptionKey, "hex"),
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );

  // Encrypt the encoded data with the key
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: initVector,
    },
    cryptoKey,
    encodedData,
  );

  // Return the encrypted data and the IV, both in base64 format
  return {
    encryptedData: Buffer.from(encryptedData).toString("base64"),
    initVector: Buffer.from(initVector).toString("base64"),
  };
};

export const handleEncryption = async <T>(data: T): Promise<EncryptedData> => {
  return await encryptData(JSON.stringify({ data }), ENCRYPTION_KEY);
};

const decryptData = async (
  encryptedData: string,
  initVector: string,
  encryptionKey: string,
): Promise<string | null> => {
  // Prepare the decryption key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(encryptionKey, "hex"),
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );

  try {
    // Decrypt the encrypted data using the key and IV
    const decodedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: Buffer.from(initVector, "base64"),
      },
      cryptoKey,
      Buffer.from(encryptedData, "base64"),
    );

    // Decode and return the decrypted data
    return new TextDecoder().decode(decodedData);
  } catch {
    return null;
  }
};

export const handleDecryption = async <T>({
  encryptedData,
  initVector,
}: {
  encryptedData: string;
  initVector: string;
}): Promise<T | null> => {
  const decryptedString = await decryptData(
    encryptedData!,
    initVector!,
    ENCRYPTION_KEY,
  );

  const responseData = JSON.parse(decryptedString ?? "null")?.data ?? null;

  return responseData as T | null;
};
