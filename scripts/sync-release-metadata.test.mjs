import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

test("release sync updates visible versions and validates before writing", async () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const cwd = await mkdtemp(join(tmpdir(), "dap-release-"));
  const files = ["downloads/index.json", "index.html", "llms.txt", "sitemap.xml"];
  const version = "9.8.7";
  const release = {
    tag_name: `v${version}`,
    published_at: "2026-10-17T08:52:44Z",
    assets: [
      `Desk-AI-Pet-Setup-${version}.exe`,
      `Desk-AI-Pet-${version}-arm64.dmg`,
    ].map((name) => ({ name, digest: `sha256:${"a".repeat(64)}`, browser_download_url: `https://example.com/${name}` })),
  };
  const run = (data = release) => spawnSync(process.execPath, [
    "--import", `data:text/javascript,${encodeURIComponent(`globalThis.fetch = async () => ({ ok: true, json: async () => (${JSON.stringify(data)}) });`)}`,
    join(root, "scripts/sync-release-metadata.mjs"),
  ], { cwd, encoding: "utf8" });
  const snapshot = () => Promise.all(files.map((file) => readFile(join(cwd, file), "utf8")));
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
    assert.match(first[1], /v1\.7\.0 · Development preview/, "Sync must not promote or relabel the development preview");
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
