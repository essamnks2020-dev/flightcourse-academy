import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function phraseSimilarity(a: string, b: string): number {
  const wordsA = a.toLowerCase().trim().split(/\s+/)
  const wordsB = b.toLowerCase().trim().split(/\s+/)
  const setA = new Set(wordsA)
  let matches = 0
  for (const w of wordsB) {
    if (setA.has(w)) matches++
  }
  return matches / Math.max(wordsA.length, wordsB.length)
}
