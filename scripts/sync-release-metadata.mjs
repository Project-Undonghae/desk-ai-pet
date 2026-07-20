import { readFile, writeFile } from "node:fs/promises";

const repository = process.env.GITHUB_REPOSITORY || "Project-Undonghae/desk-ai-pet";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const requestedTag = process.argv[2]?.trim();

if (!token) {
  throw new Error("GITHUB_TOKEN or GH_TOKEN is required.");
}

async function github(path) {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

function requireAsset(assets, name) {
  const asset = assets.find((candidate) => candidate.name === name);
  if (!asset) throw new Error(`Release asset not found: ${name}`);
  if (!asset.digest?.startsWith("sha256:")) {
    throw new Error(`Release asset is missing a sha256 digest: ${name}`);
  }
  return asset;
}

function withoutKey(object, key) {
  return Object.fromEntries(Object.entries(object || {}).filter(([entryKey]) => entryKey !== key));
}

const release = await github(
  requestedTag ? `/releases/tags/${encodeURIComponent(requestedTag)}` : "/releases/latest",
);
if (release.draft || release.prerelease) {
  throw new Error(`Refusing to publish metadata for non-stable release: ${release.tag_name}`);
}

const tag = release.tag_name;
const version = tag.replace(/^v/, "");
const win = requireAsset(release.assets, `Desk-AI-Pet-Setup-${version}.exe`);
const macArm = requireAsset(release.assets, `Desk-AI-Pet-${version}-arm64.dmg`);
const macX64 = requireAsset(release.assets, `Desk-AI-Pet-${version}.dmg`);

const indexPath = "downloads/index.json";
const downloads = JSON.parse(await readFile(indexPath, "utf8"));
downloads.updated_at = release.published_at;
downloads.latest = tag;
downloads.versions = [tag, ...(downloads.versions || []).filter((item) => item !== tag)];
downloads.files = {
  win: `https://github.com/${repository}/releases/latest/download/DeskAIPet-Setup-latest-win64.exe`,
  mac_arm64: `https://github.com/${repository}/releases/latest/download/DeskAIPet-latest-macos-arm64.dmg`,
  mac_x64: `https://github.com/${repository}/releases/latest/download/DeskAIPet-latest-macos-x64.dmg`,
};
downloads.per_version_files = {
  [tag]: {
    win: win.browser_download_url,
    mac_arm64: macArm.browser_download_url,
    mac_x64: macX64.browser_download_url,
  },
  ...withoutKey(downloads.per_version_files, tag),
};
downloads.checksums = {
  [tag]: {
    win: win.digest.slice("sha256:".length),
    mac_arm64: macArm.digest.slice("sha256:".length),
    mac_x64: macX64.digest.slice("sha256:".length),
  },
  ...withoutKey(downloads.checksums, tag),
};
await writeFile(indexPath, `${JSON.stringify(downloads, null, 2)}\n`);

const indexHtmlPath = "index.html";
const indexHtml = await readFile(indexHtmlPath, "utf8");
const softwareVersionPattern = /(\"softwareVersion\"\s*:\s*\")[^\"]+(\")/;
if (!softwareVersionPattern.test(indexHtml)) {
  throw new Error("softwareVersion marker not found in index.html");
}
const nextIndexHtml = indexHtml.replace(
  softwareVersionPattern,
  `$1${version}$2`,
);
await writeFile(indexHtmlPath, nextIndexHtml);

const llmsPath = "llms.txt";
const llms = await readFile(llmsPath, "utf8");
const releaseMarkerPattern = /^Current app release: .*$/m;
if (!releaseMarkerPattern.test(llms)) {
  throw new Error("Current app release marker not found in llms.txt");
}
const nextLlms = llms.replace(releaseMarkerPattern, `Current app release: ${tag}`);
await writeFile(llmsPath, nextLlms);

const sitemapPath = "sitemap.xml";
const sitemap = await readFile(sitemapPath, "utf8");
const syncDate = new Date().toISOString().slice(0, 10);
const landingLastmodPattern =
  /(<loc>https:\/\/project-undonghae\.github\.io\/desk-ai-pet\/<\/loc>\s*<lastmod>)[^<]+/;
if (!landingLastmodPattern.test(sitemap)) {
  throw new Error("Landing lastmod marker not found in sitemap.xml");
}
const nextSitemap = sitemap.replace(
  landingLastmodPattern,
  `$1${syncDate}`,
);
await writeFile(sitemapPath, nextSitemap);

console.log(`Synced landing release metadata to ${tag}.`);
