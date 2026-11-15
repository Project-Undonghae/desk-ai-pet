import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const files = ["downloads/index.json", "index.html", "llms.txt", "sitemap.xml"];
const version = "9.8.7";
const asset = (name, hex = "a") => ({ name, digest: `sha256:${hex.repeat(64)}`, browser_download_url: `https://example.com/${name}` });
const releaseWith = (names) => ({
  tag_name: `v${version}`,
  published_at: "2026-10-17T08:52:44Z",
  assets: names.map((name) => asset(name)),
});
const syncIn = (cwd) => (data) => spawnSync(process.execPath, [
  "--import", `data:text/javascript,${encodeURIComponent(`globalThis.fetch = async () => ({ ok: true, json: async () => (${JSON.stringify(data)}) });`)}`,
  join(root, "scripts/sync-release-metadata.mjs"),
], { cwd, encoding: "utf8" });
const snapshotIn = (cwd) => () => Promise.all(files.map((file) => readFile(join(cwd, file), "utf8")));

test("release sync updates visible versions and validates before writing", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "dap-release-"));
  const release = releaseWith([
    `Desk-AI-Pet-Setup-${version}.exe`,
    `Desk-AI-Pet-${version}-arm64.dmg`,
  ]);
  const sync = syncIn(cwd);
  const run = (data = release) => sync(data);
  const snapshot = snapshotIn(cwd);
  try {
    await mkdir(join(cwd, "downloads"));
    for (const file of files) await writeFile(join(cwd, file), await readFile(join(root, file)));
    const original = JSON.parse(await readFile(join(cwd, files[0]), "utf8"));
    const result = run();
    assert.equal(result.status, 0, result.stderr);
    const first = await snapshot();
    const downloads = JSON.parse(first[0]);
    assert.equal(downloads.latest, "v9.8.7");
    assert.equal(downloads.checksums[downloads.latest].win, "a".repeat(64));
    for (const platforms of [downloads.files, downloads.per_version_files[downloads.latest], downloads.checksums[downloads.latest]]) {
      assert.deepEqual(Object.keys(platforms), ["win", "mac_arm64"]);
    }
    assert.deepEqual(downloads.per_version_files[original.latest], original.per_version_files[original.latest], "Historical installers must be preserved");
    const [intelHistoryTag, intelHistoryFiles] = Object.entries(original.per_version_files).find(([, platforms]) => platforms.mac_x64);
    assert.deepEqual(downloads.per_version_files[intelHistoryTag], intelHistoryFiles, "Archived Intel installers must remain recorded");
    assert.deepEqual(downloads.checksums[intelHistoryTag], original.checksums[intelHistoryTag], "Archived Intel checksums must remain unchanged");
    assert.match(first[1], /"softwareVersion": "9\.8\.7"/);
    assert.match(first[1], /최신 v9\.8\.7/);
    assert.match(first[1], /Latest v9\.8\.7/);
    assert.match(first[1], /Current in v9\.8\.7/);
    assert.match(first[1], /DAP v9\.8\.7 highlights/);
    assert.match(first[1], /DAP Workspace v9\.8\.7/);
    assert.match(first[1], /Windows v1\.6\.17 · actual app captures/, "Sync must not relabel the version of the app captures");
    assert.match(first[2], /The current public release is v9\.8\.7\./);
    assert.equal(run().status, 0);
    assert.deepEqual(await snapshot(), first, "Repeated sync must be idempotent");
    const intelAsset = { name: `Desk-AI-Pet-${version}.dmg`, digest: `sha256:${"b".repeat(64)}`, browser_download_url: "https://example.com/intel.dmg" };
    assert.equal(run({ ...release, assets: [...release.assets, intelAsset] }).status, 0);
    assert.deepEqual(await snapshot(), first, "Legacy Intel assets must not reappear in active downloads");
    assert.notEqual(run({ ...release, draft: true }).status, 0);
    assert.deepEqual(await snapshot(), first, "Draft releases must never replace stable downloads");
    assert.notEqual(run({ ...release, assets: release.assets.slice(0, 1) }).status, 0);
    assert.deepEqual(await snapshot(), first, "A missing Apple Silicon installer must leave metadata intact");
    await writeFile(join(cwd, "llms.txt"), "Missing release marker");
    const beforeFailure = await snapshot();
    assert.notEqual(run().status, 0);
    assert.deepEqual(await snapshot(), beforeFailure, "Invalid documents must not partially update metadata");
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("a Mac-only release publishes Apple Silicon alone and keeps older Windows records", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "dap-release-mac-"));
  const release = releaseWith([`Desk-AI-Pet-${version}-arm64.dmg`]);
  const run = syncIn(cwd);
  const snapshot = snapshotIn(cwd);
  try {
    await mkdir(join(cwd, "downloads"));
    for (const file of files) await writeFile(join(cwd, file), await readFile(join(root, file)));
    const original = JSON.parse(await readFile(join(cwd, files[0]), "utf8"));
    const result = run(release);
    assert.equal(result.status, 0, result.stderr);
    const first = await snapshot();
    const downloads = JSON.parse(first[0]);
    assert.equal(downloads.latest, "v9.8.7");
    assert.equal(downloads.versions[0], "v9.8.7");
    for (const platforms of [downloads.files, downloads.per_version_files[downloads.latest], downloads.checksums[downloads.latest]]) {
      assert.deepEqual(Object.keys(platforms), ["mac_arm64"], "A Mac-only release must not list Windows");
    }
    assert.equal(downloads.files.win, undefined, "No Windows link for latest");
    assert.equal(downloads.per_version_files[downloads.latest].mac_arm64, `https://example.com/Desk-AI-Pet-${version}-arm64.dmg`);
    assert.equal(downloads.checksums[downloads.latest].mac_arm64, "a".repeat(64));
    for (const tag of Object.keys(original.per_version_files)) {
      assert.deepEqual(downloads.per_version_files[tag], original.per_version_files[tag], `Older installers must stay as they are: ${tag}`);
    }
    for (const tag of Object.keys(original.checksums)) {
      assert.deepEqual(downloads.checksums[tag], original.checksums[tag], `Older checksums must stay as they are: ${tag}`);
    }
    assert.ok(original.per_version_files[original.latest].win, "The fixture must start with a Windows installer on the previous release");
    assert.match(first[1], /"softwareVersion": "9\.8\.7"/);
    assert.match(first[1], /최신 v9\.8\.7/);
    assert.match(first[1], /Latest v9\.8\.7/);
    assert.match(first[1], /Current in v9\.8\.7/);
    assert.match(first[1], /DAP v9\.8\.7 highlights/);
    assert.match(first[1], /DAP Workspace v9\.8\.7/);
    assert.match(first[2], /The current public release is v9\.8\.7\./);
    assert.equal(run(release).status, 0);
    assert.deepEqual(await snapshot(), first, "Repeated Mac-only sync must be idempotent");
    const brokenWin = { ...asset(`Desk-AI-Pet-Setup-${version}.exe`), digest: undefined };
    assert.notEqual(run({ ...release, assets: [...release.assets, brokenWin] }).status, 0);
    assert.deepEqual(await snapshot(), first, "A Windows installer without a digest must leave metadata intact");
    assert.notEqual(run({ ...release, assets: [] }).status, 0);
    assert.deepEqual(await snapshot(), first, "A release without the Apple Silicon installer must leave metadata intact");
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
