/** Only production browsers collect. Local tests exercise the Worker separately. */
export const ANALYTICS_HOSTS = ["drozhkov.com", "www.drozhkov.com"];
export const ANALYTICS_ENDPOINT = "/api/aggregate";

export function isAnalyticsHost(hostname: string): boolean {
  return ANALYTICS_HOSTS.includes(hostname.toLowerCase());
}
