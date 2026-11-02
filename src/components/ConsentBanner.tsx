import { useEffect, useRef, useState } from "react";
import { denyConsent, getConsent, grantConsent, subscribeConsent } from "../analytics/analytics";
import { OPEN_SETTINGS_EVENT, openConsentSettings, type Consent } from "../analytics/consent";
import { useT } from "../i18n/context";

export function ConsentSettingsButton({ className }: { className?: string }) {
  const t = useT();
  return (
    <button type="button" className={className} onClick={openConsentSettings}>
      {t("consent.settings")}
    </button>
  );
}

/**
 * Small consent panel. Rendered only on the client (nothing in the prerendered
 * HTML), shown until the visitor picks Accept or Reject, and reopened from
 * the "Analytics settings" link.
 */
export default function ConsentBanner() {
  const t = useT();
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);
  const [reopened, setReopened] = useState(false);
  const acceptRef = useRef<HTMLButtonElement | null>(null);
  // Where focus was when the panel was reopened ("Analytics settings"); restored on close.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Client-only: the server never renders the panel, so hydration stays identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setConsent(getConsent());
    const unsubscribe = subscribeConsent(setConsent);
    const onOpen = () => {
      const active = document.activeElement;
      returnFocusRef.current = active instanceof HTMLElement ? active : null;
      setReopened(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
    return () => {
      unsubscribe();
      window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
    };
  }, []);

  const open = mounted && (consent === null || reopened);

  useEffect(() => {
    if (open && reopened) {
      acceptRef.current?.focus();
    } else if (!reopened && returnFocusRef.current) {
      const target = returnFocusRef.current;
      returnFocusRef.current = null;
      if (target.isConnected) target.focus();
    }
  }, [open, reopened]);

  useEffect(() => {
    if (!open || consent === null) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReopened(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, consent]);

  if (!open) return null;

  const choose = (value: Consent) => {
    setReopened(false);
    if (value === "granted") void grantConsent();
    else denyConsent();
  };

  return (
    <section className="consent" role="region" aria-label={t("consent.label")}>
      <div className="consent-head">
        <h2 className="consent-title">{t("consent.title")}</h2>
        {consent !== null && (
          <button
            type="button"
            className="consent-close"
            onClick={() => setReopened(false)}
            aria-label={t("consent.close")}
          >
            ×
          </button>
        )}
      </div>
      <p className="consent-body">{t("consent.body")}</p>
      <p className="consent-details">{t("consent.details")}</p>
      {consent !== null && (
        <p className="consent-current" role="status">
          {t(consent === "granted" ? "consent.current.granted" : "consent.current.denied")}
        </p>
      )}
      <div className="consent-actions">
        <button
          type="button"
          className="consent-button"
          ref={acceptRef}
          aria-pressed={consent === "granted"}
          onClick={() => choose("granted")}
        >
          {t("consent.accept")}
        </button>
        <button
          type="button"
          className="consent-button"
          aria-pressed={consent === "denied"}
          onClick={() => choose("denied")}
        >
          {t("consent.reject")}
        </button>
      </div>
    </section>
  );
}
