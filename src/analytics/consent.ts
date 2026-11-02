export type Consent = "granted" | "denied";

/** The visitor's choice. A preference, not an identifier: it holds only "granted" or "denied". */
export const CONSENT_KEY = "dr_analytics_consent";

export const OPEN_SETTINGS_EVENT = "dr:analytics-settings";

/** Reopen the consent panel (the "Analytics settings" link at the bottom of every page). */
export function openConsentSettings(): void {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

export function readConsent(): Consent | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: Consent): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage blocked: the choice holds for this page view only.
  }
}

/**
 * Remove everything the PostHog SDK may have stored: `ph_*` / `__ph_*` keys in
 * localStorage and sessionStorage, and any `ph_*` cookies.
 */
export function clearPosthogStorage(): void {
  const isPosthogKey = (key: string) => key.startsWith("ph_") || key.startsWith("__ph_");
  for (const storage of [safeStorage("localStorage"), safeStorage("sessionStorage")]) {
    if (!storage) continue;
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && isPosthogKey(key)) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  }
  try {
    for (const part of document.cookie.split(";")) {
      const name = part.split("=")[0]?.trim();
      if (name && isPosthogKey(name)) {
        const expire = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = expire;
        document.cookie = `${expire}; domain=.${window.location.hostname}`;
      }
    }
  } catch {
    // Cookies unavailable: nothing to clear.
  }
}

function safeStorage(name: "localStorage" | "sessionStorage"): Storage | null {
  try {
    return window[name];
  } catch {
    return null;
  }
}
