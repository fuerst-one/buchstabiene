import { create } from "zustand";
import { auth } from "@/auth";
import { User } from "@/server/db/schema";
import { getSessionData } from "@/server/api/session";
import { NoSessionError, UnauthorizedError } from "@/lib/errors";

export type AuthSession = {
  user: User;
};

export type ServerAuthStore = {
  sessions: Record<string, AuthSession>;
  getSession: () => Promise<AuthSession | null>;
  getSessionOrFail: () => Promise<AuthSession>;
  endSession: () => Promise<void>;
};

export const useServerAuth = create<ServerAuthStore>()((set, get) => ({
  sessions: {},
  getSession: async () => {
    const authSession = await auth();
    if (!authSession?.user?.email) {
      return null;
    }
    if (!get().sessions[authSession.user.email]) {
      const session = await getSessionData();
      if (!session) {
        return null;
      }
      set({
        sessions: { ...get().sessions, [authSession.user.email]: session },
      });
    }
    return get().sessions[authSession.user.email];
  },
  getSessionOrFail: async () => {
    const session = await get().getSession();
    if (!session) {
      throw new NoSessionError();
    }
    return session;
  },
  endSession: async () => {
    const authSession = await auth();
    if (!authSession?.user?.email) {
      return;
    }
    set((state) => {
      if (authSession.user!.email! in state.sessions) {
        delete state.sessions[authSession.user!.email!];
      }
      return state;
    });
  },
}));

export const serverAdminGuard = async () => {
  const session = await useServerAuth.getState().getSession();
  if (!session?.user.isAdmin) {
    throw new UnauthorizedError();
  }
  return session;
};

export const serverSessionGuard = async () => {
  return await useServerAuth.getState().getSessionOrFail();
};

export const getServerSessionUser = async () => {
  const session = await useServerAuth.getState().getSession();
  return session?.user ?? null;
};
