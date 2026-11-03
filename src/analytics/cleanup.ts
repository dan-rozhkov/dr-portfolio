/** Delete old analytics data. Never create a preference, identifier or migration marker. */
export function clearLegacyAnalytics(): void {
  const legacy = (key: string) =>
    key === "dr_analytics_consent" || key.startsWith("ph_") || key.startsWith("__ph_");
  for (const name of ["localStorage", "sessionStorage"] as const) {
    try {
      const storage = window[name];
      for (const key of Object.keys(storage)) if (legacy(key)) storage.removeItem(key);
    } catch {
      // Blocked storage must not stop rendering or cleanup of other stores.
    }
  }
  try {
    const host = window.location.hostname;
    const domains = [
      "",
      host,
      ...host
        .split(".")
        .map((_, i, parts) => parts.slice(i).join("."))
        .filter((d) => d.includes(".")),
    ];
    const parts = window.location.pathname.split("/");
    const paths = new Set([
      "/",
      ...parts.map((_, i) => parts.slice(0, i + 1).join("/")).filter(Boolean),
    ]);
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.split("=")[0]?.trim();
      if (!name || !legacy(name)) continue;
      for (const domain of domains)
        for (const path of paths) {
          document.cookie = `${name}=; Max-Age=0; Path=${path}${domain ? `; Domain=${domain}` : ""}`;
        }
    }
  } catch {
    // HttpOnly cookies and storage on other origins cannot be removed here.
  }
}
