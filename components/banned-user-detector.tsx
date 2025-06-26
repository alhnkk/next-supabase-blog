"use client";

import { useBannedUserDetection } from "@/hooks/use-banned-user-detection";

export function BannedUserDetector() {
  useBannedUserDetection();
  return null; // Bu component görsel bir şey render etmez
}
