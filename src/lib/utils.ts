import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const capitalize = (str: string) => {
  return str
    .split(" ")
    .map((sub) => sub.slice(0, 1).toUpperCase() + sub.slice(1))
    .join(" ");
};
