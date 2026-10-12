import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let idCounter = 0;

/**
 * Oturum içinde benzersiz ID (React key'leri için). Deterministik olması
 * gerekiyor: Math.random() prerender sırasında Next.js tarafından reddedilir.
 */
export function createId(prefix = "id") {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}
