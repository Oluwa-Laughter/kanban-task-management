import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLUMN_DOT_PALETTE = [
  "#49C4E5",
  "#8471F2",
  "#67E2AE",
  "#F2C94C",
  "#EB5757",
  "#F2994A",
  "#56CCF2",
  "#9B51E0",
];

export function columnDotColor(index: number) {
  return COLUMN_DOT_PALETTE[index % COLUMN_DOT_PALETTE.length];
}
