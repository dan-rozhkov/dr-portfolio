import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { transformRows } from "./transform.mjs";

const csvPath =
  process.env.RADAR_CSV ?? join(homedir(), "prj/labor-market-radar/data/vacancies.csv");
const outPath = join(dirname(fileURLToPath(import.meta.url)), "../../src/data/jobs.json");

function fail(message) {
  console.error(`sync:jobs failed: ${message}`);
  process.exit(1);
}

if (!existsSync(csvPath)) fail(`CSV not found at ${csvPath}`);

const text = readFileSync(csvPath, "utf8").replace(/^﻿/, "");
const rows = parse(text, { columns: true, skip_empty_lines: true });
if (rows.length === 0) fail(`no rows in ${csvPath}`);

const data = transformRows(rows);
if (data.jobs.length === 0) fail("no jobs passed the filters");

writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n");
console.log(
  `sync:jobs wrote ${data.jobs.length} jobs (last check ${data.lastCheck}) to ${outPath}`,
);
