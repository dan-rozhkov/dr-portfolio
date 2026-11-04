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
  for (const title of ["Forward Deployed Engineer (FDE) - Seattle", "Forward Deployed Engineer, GTM, AMER", "Forward Deployed Consultant, Manufacturing", "Growth Engineer", "Growth Engineer, Startups & SMBs", "CRM Marketing Manager", "Senior CRM Manager - Automation & AI", "Full Stack Software Engineer, Product Explorations"]) {
    it(`rejects off-filter role ${title}`, () => {
      expect(transformRows([{...row, title_original:title, role_family:"gtm_engineering"}]).jobs).toEqual([]);
    });
  }
  for (const title of ["GTM Engineer - Growth", "Senior Go-to-Market Engineer", "Software Engineer, Product", "Applied AI Engineer, Plugins", "Senior AI Solutions Engineer - GTM"]) {
    it(`keeps in-filter role ${title}`, () => expect(transformRows([{...row,title_original:title}]).jobs).toHaveLength(1));
  }
  it("published data excludes all reviewed records", () => {
    const data=JSON.parse(readFileSync(new URL("../../src/data/jobs.json",import.meta.url),"utf8"));
    const ids=["cognition_589326d3-9dc0-447e-ae0c-972b808f831d","openai_43174eb6-0ffe-4744-9323-c7969e7ea2e1","granola_f928eaec-2215-4811-9593-eb084eddef6c","radiant_c5c3c385-0ae8-4850-a6f2-f9777cd41091","maple_ce08234e-7918-4775-879b-afb066a30460","notion_10437426-14c8-4c45-8075-67959ce80393","miro_8894283002","indrive_168add7b-ba86-4350-9fda-ec7dd5a64aae","openai_4d1ede8c-3d4c-4503-8408-81e4b68c5c91","openai_7f4c5eef-37f9-4454-a1fb-ef1e66b075d9","granola_494fe9a6-0144-4ebd-89a8-b8a187f93ff1","notion_45f60d0e-e44f-40c5-985e-4096a8966860","lingokids_8373955"];
    expect(data.jobs.filter(j=>ids.includes(j.id))).toEqual([]);
    expect(data.stats.open).toBe(data.jobs.length);
  });
});
