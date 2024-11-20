export type MessageType =
  | "short"
  | "error"
  | "duplicate"
  | "correct"
  | "pangram";

export type Message = { className: string; text: string; score?: number };

export const messages: Record<MessageType, Message> = {
  short: { className: "text-red-500", text: "Zu kurz" },
  error: { className: "text-red-500", text: "Kein valides Wort" },
  duplicate: { className: "text-red-500", text: "Schon gefunden" },
  correct: { className: "text-green-500", text: "Toll!" },
  pangram: {
    className: "bg-yellow-500 text-black font-semibold rounded-sm px-1",
    text: "Pangramm!",
  },
};
