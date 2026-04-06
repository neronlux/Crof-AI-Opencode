import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const allowedFiles = new Set(["README.md", "opencode.json", "package.json", ".markdownlint.json", ".gitignore"]);
const allowedPlaceholders = new Set([
  "YOUR_CROF_API_KEY",
  "api-key-here",
  "MODEL-FROM-LIST"
]);

const patterns = [
  { name: "Crof key", regex: /nahcrof_[A-Za-z0-9_-]{12,}/g },
  { name: "OpenAI-style key", regex: /sk-[A-Za-z0-9_-]{12,}/g },
  { name: "GitHub token", regex: /gh[pousr]_[A-Za-z0-9_]{12,}/g },
  { name: "Google API key", regex: /AIza[0-9A-Za-z\-_]{20,}/g },
  { name: "Bearer token", regex: /Bearer\s+[A-Za-z0-9._-]{20,}/g }
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(root, fullPath);

    if (entry.name === ".git" || entry.name === "node_modules") continue;

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (!allowedFiles.has(relPath)) continue;
    files.push(fullPath);
  }
  return files;
}

function getLineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

function isAllowedMatch(match) {
  for (const value of allowedPlaceholders) {
    if (match.includes(value)) return true;
  }
  return false;
}

const files = await walk(root);
const findings = [];

for (const file of files) {
  const fileStat = await stat(file);
  if (!fileStat.isFile()) continue;

  const text = await readFile(file, "utf8");
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern.regex)) {
      const value = match[0];
      if (isAllowedMatch(value)) continue;
      findings.push({
        file: path.relative(root, file),
        line: getLineNumber(text, match.index ?? 0),
        type: pattern.name,
        value
      });
    }
  }
}

if (findings.length) {
  console.error("Potential secrets found:\n");
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} ${finding.type} -> ${finding.value}`);
  }
  process.exit(1);
}

console.log("No potential secrets found in tracked docs/config files.");
