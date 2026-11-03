import * as _data from "./en";

export const getProfile = () => _data.profile;
export const getHero = () => _data.hero;
export const getCases = () => _data.cases;
export const getExtraWork = () => _data.extraWork;
export const getAbout = () => _data.about;
export const getRecognition = () => _data.recognition;
export const getSkills = () => _data.skills;
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
