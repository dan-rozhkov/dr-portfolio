import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { collect, INGESTION_URL } from "./worker";
import { knownPage, validateEvent } from "./schema";
import pages from "./pages.json";
import { getCases } from "../data/portfolio";
import { getPosts } from "../writing/posts";

const request = (
  body: unknown = { event: "$pageview", page: "/en" },
  headers = {},
  url = "https://drozhkov.com/api/aggregate",
) =>
  new Request(url, {
    method: "POST",
    headers: { Origin: "https://drozhkov.com", "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
afterEach(() => vi.unstubAllGlobals());

describe("server privacy boundary", () => {
  it("rebuilds the entire outgoing request, without client identifiers or headers", async () => {
    const send = vi.fn(async () => new Response('{"status":1}'));
    vi.stubGlobal("fetch", send);
    const response = await collect(
      request(
        { event: "contact_clicked", page: "/ru/case/seligoai", channel: "email" },
        {
          Cookie: "ph_old=private",
          Referer: "https://drozhkov.com/en/?token=private",
          "User-Agent": "private-browser",
          "CF-Connecting-IP": "192.0.2.99",
          "X-Forwarded-For": "192.0.2.99",
        },
      ),
    );
    expect(response.status).toBe(204);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(send).toHaveBeenCalledTimes(1);
    const [url, init] = send.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(INGESTION_URL);
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      "CF-Connecting-IP": "0.0.0.0",
      "X-Real-IP": "0.0.0.0",
      "X-Forwarded-For": "0.0.0.0",
      "CF-Connecting-IPv6": "::",
      "CF-IPCountry": "XX",
    });
    expect(JSON.parse(init.body as string)).toEqual({
      api_key: expect.stringMatching(/^phc_/),
      event: "contact_clicked",
      distinct_id: "portfolio-aggregate-v1",
      properties: {
        analytics_mode: "aggregate_v1",
        page: "/ru/case/seligoai",
        lang: "ru",
        case_id: "seligoai",
        channel: "email",
        $process_person_profile: false,
        $geoip_disable: true,
        $ip: "0.0.0.0",
      },
    });
    expect(init.body).not.toMatch(/private|192\.0\.2|session|device|referrer|user_agent|utm_|uuid/);
    expect(init.redirect).toBe("manual");
    const next = await collect(request());
    expect(next.status).toBe(204);
    expect(
      JSON.parse((send.mock.calls[1] as unknown as [string, RequestInit])[1].body as string)
        .distinct_id,
    ).toBe("portfolio-aggregate-v1");
  });

  it("rejects arbitrary fields, query/hash leakage, unknown pages and invalid events before networking", async () => {
    const send = vi.fn();
    vi.stubGlobal("fetch", send);
    for (const body of [
      null,
      [],
      { event: "$identify", page: "/en" },
      { event: "$pageview", page: "/en", distinct_id: "x" },
      { event: "$pageview", page: "/en?secret=x" },
      { event: "$pageview", page: "/en#secret" },
      { event: "$pageview", page: "/en/private@example.com" },
      { event: "contact_clicked", page: "/en", channel: "private@example.com" },
      { event: "case_viewed", page: "/en" },
    ]) {
      expect((await collect(request(body))).status).toBe(400);
    }
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects cross-origin, preview, wrong method/type, oversized and malformed requests", async () => {
    const send = vi.fn();
    vi.stubGlobal("fetch", send);
    expect((await collect(request({}, { Origin: "https://attacker.com" }))).status).toBe(403);
    expect(
      (await collect(request({}, {}, "https://preview.workers.dev/api/aggregate"))).status,
    ).toBe(403);
    expect(
      (await collect(request({}, {}, "https://drozhkov.com/api/aggregate?email=secret"))).status,
    ).toBe(404);
    expect((await collect(new Request("https://drozhkov.com/api/aggregate"))).status).toBe(405);
    expect((await collect(request({}, { "Content-Type": "text/plain" }))).status).toBe(415);
    expect((await collect(request("x".repeat(600)))).status).toBe(413);
    expect(
      (
        await collect(
          new Request("https://drozhkov.com/api/aggregate", {
            method: "POST",
            headers: { Origin: "https://drozhkov.com", "Content-Type": "application/json" },
            body: "{",
          }),
        )
      ).status,
    ).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("reports upstream failure and never forwards upstream response headers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response("private", { status: 401, headers: { "Set-Cookie": "bad=x" } }),
      ),
    );
    const response = await collect(request());
    expect(response.status).toBe(502);
    expect(await response.text()).toBe("");
    expect(response.headers.get("Set-Cookie")).toBeNull();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    expect((await collect(request())).status).toBe(502);
  });

  it("preserves static asset serving", async () => {
    const assets = { fetch: vi.fn(async () => new Response("page")) };
    expect(
      await (
        await worker.fetch(new Request("https://drozhkov.com/privacy.html"), { ASSETS: assets })
      ).text(),
    ).toBe("page");
    expect(assets.fetch).toHaveBeenCalledTimes(1);
  });

  it("keeps the finite allowlist in sync with published content", () => {
    const expected = [
      "/en",
      "/ru",
      "/en/jobs",
      "/en/cases",
      ...getPosts().map((p) => `/en/cases/${p.slug}`),
      ...getCases().flatMap((c) => [`/en/case/${c.id}`, `/ru/case/${c.id}`]),
    ];
    expect([...pages].sort()).toEqual(expected.sort());
    expect(knownPage("/en/?utm_source=private#private")).toBe("/en");
    expect(validateEvent({ event: "$pageview", page: "/en/" })).toBeNull();
  });
});
