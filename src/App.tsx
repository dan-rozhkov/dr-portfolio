import { useEffect } from "react";
import { getCaseStudy, setDataLang } from "./data/portfolio";
import CaseStudy from "./CaseStudy";
import Contact from "./Contact";
import Header from "./components/Header";
import CustomCursor from "./components/CustomCursor";
import Hero from "./components/Hero";
import LatestCases from "./components/LatestCases";
import ExtraWork from "./components/ExtraWork";
import About from "./components/About";
import Recognition from "./components/Recognition";
import SkillsPhysics from "./components/SkillsPhysics";
import ContactObserver from "./components/ContactObserver";
import ScrollFade from "./components/ScrollFade";
import { useRoute } from "./hooks/useRoute";
import { I18nProvider } from "./i18n/context";
import WritingIndex from "./writing/WritingIndex";
import JobsPage from "./jobs/JobsPage";
import PostPage from "./writing/PostPage";
import { getPost } from "./writing/posts";
import { getPageTitle } from "./lib/pageTitle";
import { trackPage } from "./analytics/analytics";

export default function App({ initialPath }: { initialPath?: string }) {
  const path = initialPath ?? (typeof window !== "undefined" ? window.location.pathname : "/");

  const [route] = useRoute(path);
  const lang = route.lang;
  setDataLang(lang);

  const pageTitle = getPageTitle(route);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  // Count only known pages. Repeated effects and query/hash changes do not add views.
  useEffect(() => {
    trackPage(window.location.pathname);
  }, [route]);

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

  if (route.name === "cases") {
    return (
      <I18nProvider lang={lang}>
        <CustomCursor />
        <Header />
        <WritingIndex category={route.category} />
        <Contact />
        <ContactObserver />
      </I18nProvider>
    );
  }

  if (route.name === "jobs") {
    return (
      <I18nProvider lang={lang}>
        <CustomCursor />
        <Header />
        <JobsPage />
        <Contact />
        <ContactObserver />
      </I18nProvider>
    );
  }

  if (route.name === "post") {
    return (
      <I18nProvider lang={lang}>
        <CustomCursor />
        <Header />
        <PostPage post={getPost(route.slug)} />
        <ContactObserver />
      </I18nProvider>
    );
  }

  return (
    <I18nProvider lang={lang}>
      <CustomCursor />
      <Header />
      <main className="snap-container">
        <Hero />
        <LatestCases />
        <ExtraWork />
        <About />
        <Recognition />
        <SkillsPhysics />
        <Contact />
      </main>
      <ContactObserver />
      <ScrollFade />
    </I18nProvider>
  );
}
