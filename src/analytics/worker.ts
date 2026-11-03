import { ANALYTICS_ENDPOINT, isAnalyticsHost } from "./config";
import { validateEvent, type AggregateEvent } from "./schema";

// Existing public project token, moved out of the browser. No new account or secret.
const POSTHOG_KEY = "phc_kxeyMH86iftyRYWYi96yi9KCvujMbdHmERZysvzvZQGD";
export const INGESTION_URL = "https://eu.i.posthog.com/i/v0/e/";

/** One shared dataset label, never a visitor, device, session or random event identifier. */
export function ingestionPayload(value: AggregateEvent) {
  const caseId = value.page.includes("/case/") ? value.page.split("/").at(-1) : undefined;
  return {
    api_key: POSTHOG_KEY,
    event: value.event,
    distinct_id: "portfolio-aggregate-v1",
    properties: {
      analytics_mode: "aggregate_v1",
      page: value.page,
      lang: value.page.split("/")[1],
      ...(caseId ? { case_id: caseId } : {}),
      ...(value.channel ? { channel: value.channel } : {}),
      $process_person_profile: false,
      $geoip_disable: true,
      $ip: "0.0.0.0",
    },
  };
}

const reply = (status: number) =>
  new Response(null, { status, headers: { "Cache-Control": "no-store" } });

export async function collect(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== ANALYTICS_ENDPOINT || url.search) return reply(404);
  if (request.method !== "POST") return reply(405);
  // Require both the production target and its exact origin. No permissive CORS.
  if (!isAnalyticsHost(url.hostname) || request.headers.get("Origin") !== url.origin)
    return reply(403);
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") return reply(403);
  if (request.headers.get("Content-Type") !== "application/json") return reply(415);
  if (Number(request.headers.get("Content-Length")) > 512) return reply(413);
  // Enforce a bound even when Content-Length is absent or false.
  const reader = request.body?.getReader();
  if (!reader) return reply(400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 512) {
        await reader.cancel();
        return reply(413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    let input: unknown;
    try {
      input = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return reply(400);
    }
    const event = validateEvent(input);
    if (!event) return reply(400);
    // Construct a NEW request. Never forward client headers, IP, cookies, UA or referrer.
    const response = await fetch(INGESTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Cloudflare can add client-IP headers to subrequests. Override them explicitly.
        "CF-Connecting-IP": "0.0.0.0",
        "X-Real-IP": "0.0.0.0",
        "X-Forwarded-For": "0.0.0.0",
        "CF-Connecting-IPv6": "::",
        "CF-IPCountry": "XX",
      },
      body: JSON.stringify(ingestionPayload(event)),
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });
    return reply(response.ok ? 204 : 502);
  } catch {
    return reply(502);
  }
}

export default {
  async fetch(request: Request, env: { ASSETS: { fetch(request: Request): Promise<Response> } }) {
    if (new URL(request.url).pathname.startsWith("/api/")) return collect(request);
    return env.ASSETS.fetch(request);
  },
};
