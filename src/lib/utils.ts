import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Math.random() prerender sırasında Next.js tarafından reddedildiği için sayaç kullanılır.
let idCounter = 0;

export function createId(prefix = "id") {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}
