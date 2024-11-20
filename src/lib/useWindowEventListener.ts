import { useEffect } from "react";

export const useWindowEventListener = <Key extends keyof WindowEventMap>(
  eventKey: Key,
  handler: (this: Window, ev: WindowEventMap[Key]) => void,
  deps: unknown[] = []
) => {
  useEffect(() => {
    window.addEventListener(eventKey, handler, false);
    return () => {
      window.removeEventListener(eventKey, handler, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
