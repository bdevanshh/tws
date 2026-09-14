"use client";

import { Toaster } from "sonner";
import { StoreProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.19 0.02 280)",
            border: "1px solid oklch(0.78 0.13 82 / 0.35)",
            color: "oklch(0.94 0.015 90)",
          },
        }}
      />
      {children}
    </StoreProvider>
  );
}
