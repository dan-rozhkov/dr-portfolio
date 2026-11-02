// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { PostHog } from "posthog-js";
import ConsentBanner, { ConsentSettingsButton } from "./ConsentBanner";
import { I18nProvider } from "../i18n/context";
import { __testing, getConsent } from "../analytics/analytics";
import type { Lang } from "../i18n/translations";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let loader: Mock<() => Promise<PostHog>>;

function mount(lang: Lang = "en") {
  act(() => {
    root.render(
      <I18nProvider lang={lang}>
        <ConsentBanner />
        <ConsentSettingsButton className="contact-privacy" />
      </I18nProvider>,
    );
  });
}

const panel = () => container.querySelector(".consent");
const button = (label: string) =>
  [...container.querySelectorAll("button")].find((b) => b.textContent === label)!;

beforeEach(() => {
  localStorage.clear();
  const ph = {
    init: vi.fn(),
    capture: vi.fn(),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
    reset: vi.fn(),
    set_config: vi.fn(),
  };
  loader = vi.fn(async () => ph as unknown as PostHog);
  __testing.reset({ loader, enabledHost: () => true });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("ConsentBanner", () => {
  it("shows two equal choices until the visitor decides", () => {
    mount();
    expect(panel()).not.toBeNull();
    const accept = button("Accept analytics");
    const reject = button("Reject analytics");
    expect(accept.className).toBe(reject.className);
    expect(panel()!.textContent).toContain("PostHog EU Cloud");
  });

  it("speaks Russian on Russian pages", () => {
    mount("ru");
    expect(button("Принять аналитику")).toBeDefined();
    expect(button("Отклонить аналитику")).toBeDefined();
  });

  it("reject hides the panel and loads nothing", () => {
    mount();
    act(() => button("Reject analytics").click());
    expect(panel()).toBeNull();
    expect(getConsent()).toBe("denied");
    expect(loader).not.toHaveBeenCalled();
  });

  it("accept hides the panel and starts analytics", async () => {
    mount();
    await act(async () => button("Accept analytics").click());
    expect(panel()).toBeNull();
    expect(getConsent()).toBe("granted");
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("settings reopen the panel with the current choice and allow withdrawal", async () => {
    mount();
    await act(async () => button("Accept analytics").click());
    act(() => button("Analytics settings").click());
    expect(panel()!.textContent).toContain("Current choice: analytics accepted.");
    act(() => button("Reject analytics").click());
    expect(panel()).toBeNull();
    expect(getConsent()).toBe("denied");
  });

  it("returns focus to Analytics settings when the reopened panel closes", async () => {
    mount();
    act(() => button("Reject analytics").click());
    const settings = button("Analytics settings");
    settings.focus();
    act(() => settings.click());
    expect(document.activeElement).toBe(button("Accept analytics"));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(settings);
  });

  it("stays hidden on later visits once a choice is stored", () => {
    localStorage.setItem("dr_analytics_consent", "denied");
    __testing.reset({ loader, enabledHost: () => true });
    // initAnalytics reads storage; emulate the client entry.
    return import("../analytics/analytics").then(({ initAnalytics }) => {
      initAnalytics();
      mount();
      expect(panel()).toBeNull();
    });
  });
});
