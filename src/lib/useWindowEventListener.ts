import { useEffect } from "react";

export const useWindowEventListener = <Key extends keyof WindowEventMap>(
  eventKey: Key,
  handler: (this: Window, ev: WindowEventMap[Key]) => any,
  deps: any[] = []
) => {
  useEffect(() => {
    window.addEventListener(eventKey, handler, false);
    return () => {
      window.removeEventListener(eventKey, handler, false);
    };
  }, deps);
};
