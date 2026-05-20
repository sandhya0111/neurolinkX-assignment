import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines standard Tailwind classes with conditional ones, resolving conflicts safely.
 * An essential utility for highly dynamic and style-heavy SaaS interfaces.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
