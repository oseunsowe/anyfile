"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PlanId } from "@/lib/plans";

export type Entitlements = {
  loggedIn: boolean;
  email: string | null;
  plan: PlanId;
};

const DEFAULT_ENTITLEMENTS: Entitlements = { loggedIn: false, email: null, plan: "free" };

const EntitlementsContext = createContext<Entitlements>(DEFAULT_ENTITLEMENTS);

/**
 * Bridges the server-read demo session into the client tree.
 *
 * The session cookie is httpOnly (by design — client JS should not be able to
 * forge it), so client components cannot read it directly. `RootLayout` reads
 * it once per request and hands the result down through this provider.
 */
export function EntitlementsProvider({
  value,
  children,
}: {
  value: Entitlements;
  children: ReactNode;
}) {
  return (
    <EntitlementsContext.Provider value={value}>{children}</EntitlementsContext.Provider>
  );
}

export function useEntitlements(): Entitlements {
  return useContext(EntitlementsContext);
}
