import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_DIRECTORY = fileURLToPath(new URL("../", import.meta.url));
const BUILD_DIRECTORY = join(PROJECT_DIRECTORY, "dist");
const RELEASE_DIRECTORY = join(PROJECT_DIRECTORY, "releases");

/** Checks, tests, builds, and packages the extension for Chrome Web Store. */
function packageExtension() {
  execFileSync("zip", ["-v"], { stdio: "ignore" });

  for (const command of ["check", "test", "build"]) {
    execFileSync("pnpm", [command], {
      cwd: PROJECT_DIRECTORY,
      stdio: "inherit",
    });
  }

  const manifest = JSON.parse(
    readFileSync(join(BUILD_DIRECTORY, "manifest.json"), "utf8"),
  );
  const archiveName = `folio-currency-converter-${manifest.version}.zip`;

  mkdirSync(RELEASE_DIRECTORY, { recursive: true });

  const temporaryDirectory = mkdtempSync(join(RELEASE_DIRECTORY, ".package-"));
  const archivePath = join(RELEASE_DIRECTORY, archiveName);

  try {
    const temporaryArchive = join(temporaryDirectory, archiveName);

    execFileSync(
      "zip",
      ["-q", "-r", temporaryArchive, ".", "-x", ".DS_Store", "*/.DS_Store"],
      { cwd: BUILD_DIRECTORY, stdio: "inherit" },
    );
    renameSync(temporaryArchive, archivePath);
    console.info(`Chrome Web Store package: ${archivePath}`);
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

try {
  packageExtension();
} catch (error) {
  console.error("Packaging failed. See the command output above.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
