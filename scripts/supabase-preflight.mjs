import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const readIfExists = (filePath) => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
};

const parseEnvContent = (content) => {
  if (!content) {
    return {};
  }

  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) {
        return acc;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      acc[key] = rawValue.replace(/^['\"]|['\"]$/g, "");
      return acc;
    }, {});
};

const getProjectRefFromUrl = (url) => {
  if (!url) {
    return null;
  }

  try {
    const hostname = new URL(url).hostname;
    if (!hostname.endsWith(".supabase.co")) {
      return null;
    }

    return hostname.split(".")[0];
  } catch {
    return null;
  }
};

const configTomlPath = path.join(repoRoot, "supabase", "config.toml");
const configToml = readIfExists(configTomlPath) ?? "";
const configProjectId = configToml.match(/^project_id\s*=\s*"([^"]+)"/m)?.[1] ?? null;

const envPath = path.join(repoRoot, ".env");
const envLocalPath = path.join(repoRoot, ".env.local");
const env = {
  ...parseEnvContent(readIfExists(envPath)),
  ...parseEnvContent(readIfExists(envLocalPath)),
  ...process.env,
};

const supabaseUrl = env.VITE_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? null;
const frontendProjectRef = getProjectRefFromUrl(supabaseUrl);

const functionsDir = path.join(repoRoot, "supabase", "functions");
const functionNames = fs.existsSync(functionsDir)
  ? fs
      .readdirSync(functionsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

const migrationDir = path.join(repoRoot, "supabase", "migrations");
const migrationCount = fs.existsSync(migrationDir)
  ? fs
      .readdirSync(migrationDir)
      .filter((name) => name.endsWith(".sql"))
      .length
  : 0;

const issues = [];

if (!supabaseUrl) {
  issues.push("No se encontró VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL en .env, .env.local o entorno actual.");
}

if (!configProjectId) {
  issues.push("No se pudo leer project_id desde supabase/config.toml.");
}

if (frontendProjectRef && configProjectId && frontendProjectRef !== configProjectId) {
  issues.push(
    `Proyecto diferente: frontend apunta a '${frontendProjectRef}' pero Supabase CLI config apunta a '${configProjectId}'.`,
  );
}

console.log("\n=== Supabase preflight ===");
console.log(`Frontend URL: ${supabaseUrl ?? "(no definida)"}`);
console.log(`Frontend project ref: ${frontendProjectRef ?? "(no detectable)"}`);
console.log(`supabase/config.toml project_id: ${configProjectId ?? "(no definido)"}`);
console.log(`Edge functions en repo (${functionNames.length}): ${functionNames.join(", ") || "(ninguna)"}`);
console.log(`Migraciones SQL en repo: ${migrationCount}`);

if (issues.length > 0) {
  console.log("\nProblemas detectados:");
  for (const issue of issues) {
    console.log(`- ${issue}`);
  }
  process.exitCode = 1;
} else {
  console.log("\nSin problemas obvios detectados en la configuración local del repo.");
}
