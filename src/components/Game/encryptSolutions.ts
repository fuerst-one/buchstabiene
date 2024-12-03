import { handleDecryption, handleEncryption } from "@/lib/encryption";

export const encryptSolutions = async (solutions: string[]) => {
  return await handleEncryption(solutions);
};

export const decryptSolutions = async (
  encryptedData: string,
  initVector: string,
) => {
  return await handleDecryption<string[]>({
    encryptedData,
    initVector,
  });
};
