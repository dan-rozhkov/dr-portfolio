import type { Lang } from "../i18n/translations";
import * as enData from "./en";
import * as ruData from "./ru";

let _data: typeof enData = enData;

export function setDataLang(lang: Lang): void {
  _data = lang === "en" ? enData : ruData;
}

// Re-export all data through getter functions so
// setDataLang() can switch the source before render.

export const getProfile = () => _data.profile;
export const getHero = () => _data.hero;
export const getCases = () => _data.cases;
export const getExtraWork = () => _data.extraWork;
export const getAbout = () => _data.about;
export const getRecognition = () => _data.recognition;
export const getCaseStudy = (id: string) => _data.getCaseStudy(id);
export const getCase = (id: string) => _data.getCase(id);

// Re-export types
export type {
  MetaEntry,
  RecognitionItem,
  RecognitionGroup,
  Profile,
  Hero,
  CaseSummary,
  ExtraWork,
  SectionStat,
  CaseSection,
  CaseStudy,
} from "./en";
