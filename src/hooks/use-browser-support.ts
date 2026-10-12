"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Tarayıcıya özgü bir özelliğin desteklenip desteklenmediğini hydration
 * uyumsuzluğu yaratmadan okur: sunucuda ve ilk render'da false döner.
 */
export function useBrowserSupport(check: () => boolean) {
  return useSyncExternalStore(subscribe, check, () => false);
}
