import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False on the server and during hydration, true afterwards — a hydration-safe gate for browser-only values.
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
