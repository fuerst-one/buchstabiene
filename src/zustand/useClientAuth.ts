import { create } from "zustand";
import { AuthSession } from "./useServerAuth";
import { NoSessionError } from "@/lib/errors";

export type ClientAuthStore = {
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  getSession: () => AuthSession | null;
  getSessionOrThrow: () => AuthSession;
};

export const useClientAuth = create<ClientAuthStore>()((set, get) => ({
  session: null,
  setSession: (session) => set({ session }),
  getSession: () => get().session,
  getSessionOrThrow: () => {
    const session = get().session;
    if (!session?.user) {
      throw new NoSessionError();
    }
    return session;
  },
}));
