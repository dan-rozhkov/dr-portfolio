import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { transformRows } from "./transform.mjs";
const row = {market:"world", role_family:"product_building", status:"active", vacancy_id:"test", company:"Test", title_original:"Product Engineer", first_seen_at:"2026-10-30T00:00:00Z", last_checked_at:"2026-10-31T00:00:00Z"};
describe("responsibility-reviewed target selection", () => {
  for (const title of ["Devops Engineer, Federal", "Backend Software Engineer, GTM Innovation", "Product Engineer (Backend)", "Site Reliability Engineer", "Infrastructure Engineer"]) {
    it(`rejects mislabeled ${title} despite AI/product/GTM wording`, () => {
      expect(transformRows([{...row, title_original:title, responsibilities:"AI automation product GTM"}]).jobs).toEqual([]);
    });
  }
  it("honors reviewed infrastructure exclusion even with a product title", () => {
    expect(transformRows([{...row, title_original:"Senior Field Product Engineer", notes:"review; target_selection=excluded; reason=cloud deployments"}]).jobs).toEqual([]);
  });
  for (const [title, family] of [["Senior Design Engineer - Design System & Platform UI","design_engineering"],["Founding Product Designer","design_engineering"],["Product Engineer (Full Stack)","product_building"],["GTM Systems Engineer","gtm_engineering"]]) {
    it(`preserves ${title}`, () => expect(transformRows([{...row,title_original:title,role_family:family}]).jobs).toHaveLength(1));
  }
  it("published data excludes all four reviewed records", () => {
    const data=JSON.parse(readFileSync(new URL("../../src/data/jobs.json",import.meta.url),"utf8"));
    const ids=["cognition_589326d3-9dc0-447e-ae0c-972b808f831d","openai_43174eb6-0ffe-4744-9323-c7969e7ea2e1","granola_f928eaec-2215-4811-9593-eb084eddef6c","radiant_c5c3c385-0ae8-4850-a6f2-f9777cd41091"];
    expect(data.jobs.filter(j=>ids.includes(j.id))).toEqual([]);
    expect(data.stats.open).toBe(data.jobs.length);
  });
});
