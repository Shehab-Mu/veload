import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceReadme = resolve(packageRoot, "..", "README.md");
const packageReadme = resolve(packageRoot, "README.md");
const packageKey = createHash("sha256").update(packageRoot).digest("hex").slice(0, 16);
const markerPath = resolve(tmpdir(), `veload-readme-${packageKey}.json`);

function digest(content) {
  return createHash("sha256").update(content).digest("hex");
}

function prepare() {
  if (existsSync(packageReadme)) {
    throw new Error(`Refusing to overwrite existing file: ${packageReadme}`);
  }
  if (existsSync(markerPath)) {
    throw new Error(`A previous packaging operation needs cleanup: ${markerPath}`);
  }

  const content = readFileSync(sourceReadme);
  writeFileSync(packageReadme, content, { flag: "wx" });

  try {
    writeFileSync(
      markerPath,
      JSON.stringify({ packageReadme, sha256: digest(content) }),
      { flag: "wx" },
    );
  } catch (error) {
    if (existsSync(packageReadme) && digest(readFileSync(packageReadme)) === digest(content)) {
      rmSync(packageReadme);
    }
    throw error;
  }

  console.log("Prepared the root README for npm packaging.");
}

function cleanup() {
  if (!existsSync(markerPath)) {
    return;
  }

  const marker = JSON.parse(readFileSync(markerPath, "utf8"));
  if (marker.packageReadme !== packageReadme) {
    throw new Error(`Packaging marker points to an unexpected file: ${markerPath}`);
  }

  if (existsSync(packageReadme)) {
    if (digest(readFileSync(packageReadme)) !== marker.sha256) {
      throw new Error(`Preserving README changed during packaging: ${packageReadme}`);
    }
    rmSync(packageReadme);
  }

  rmSync(markerPath);
  console.log("Removed the temporary package README.");
}

const action = process.argv[2];
if (action === "prepare") {
  prepare();
} else if (action === "cleanup") {
  cleanup();
} else {
  throw new Error('Expected "prepare" or "cleanup".');
}
