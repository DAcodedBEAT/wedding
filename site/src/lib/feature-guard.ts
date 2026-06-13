import { redirect } from "@tanstack/react-router";
import { wedding } from "../config/wedding";

/**
 * Route `beforeLoad` guard for the feature flags: if the section is turned off
 * in `wedding.features`, redirect home so a disabled section is unreachable
 * even by typing its URL (keeps the flag honest, not just nav-deep).
 */
export function requireFeature(feature: keyof typeof wedding.features) {
  return () => {
    if (!wedding.features[feature]) throw redirect({ to: "/" });
  };
}
