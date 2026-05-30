import { getCases, getCaseStudy } from "./data/portfolio";
import CaseStudy from "./CaseStudy";
import Contact from "./Contact";
import Header from "./components/Header";
import CustomCursor from "./components/CustomCursor";
import Hero from "./components/Hero";
import CaseSection from "./components/CaseSection";
import ExtraWork from "./components/ExtraWork";
import About from "./components/About";
import Recognition from "./components/Recognition";
import CaseIndicator from "./components/CaseIndicator";
import ContactObserver from "./components/ContactObserver";
import ScrollFade from "./components/ScrollFade";
import { useRoute } from "./hooks/useRoute";
import { I18nProvider } from "./i18n/context";
import { setDataLang } from "./data/portfolio";
import type { Lang } from "./i18n/translations";
import { extractLang } from "./hooks/useRoute";

export default function App({ initialPath }: { initialPath?: string }) {
  const path =
    initialPath ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const lang: Lang = extractLang(path);
  setDataLang(lang);

  const [route] = useRoute(path);
  const cases = getCases();

  if (route.name === "case") {
    const study = getCaseStudy(route.id);
    if (study) {
      return (
        <I18nProvider lang={lang}>
          <CustomCursor />
          <Header />
          <CaseStudy study={study} />
          <ContactObserver />
        </I18nProvider>
      );
    }
  }

  return (
    <I18nProvider lang={lang}>
      <CustomCursor />
      <Header />
      <main className="snap-container">
        <Hero />
        {cases.map((item, index) => (
          <CaseSection item={item} first={index === 0} key={item.id} />
        ))}
        <ExtraWork />
        <About />
        <Recognition />
        <Contact />
      </main>
      <CaseIndicator />
      <ContactObserver />
      <ScrollFade />
    </I18nProvider>
  );
}
