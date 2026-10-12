"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useBrowserSupport(check: () => boolean) {
  return useSyncExternalStore(subscribe, check, () => false);
}
