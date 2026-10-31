import type { CaseSection } from "../data/portfolio";

export type SubheadSection = Extract<CaseSection, { kind: "subhead" }>;

export type Group =
  | { kind: "slider"; items: SubheadSection[] }
  | { kind: "single"; section: CaseSection };

export function groupSections(sections: CaseSection[]): Group[] {
  const groups: Group[] = [];
  let buffer: SubheadSection[] = [];
  const flush = () => {
    if (buffer.length === 0) return;
    if (buffer.length > 1) {
      groups.push({ kind: "slider", items: buffer });
    } else {
      groups.push({ kind: "single", section: buffer[0] });
    }
    buffer = [];
  };

  for (const s of sections) {
    if (s.kind === "subhead") {
      buffer.push(s);
    } else {
      flush();
      groups.push({ kind: "single", section: s });
    }
  }
  flush();
  return groups;
}
