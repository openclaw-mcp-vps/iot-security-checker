import { promises as fs } from "node:fs";
import path from "node:path";

interface AccessGrant {
  email: string;
  provider: "stripe";
  purchaseReference: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const GRANTS_FILE = path.join(DATA_DIR, "access-grants.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(GRANTS_FILE);
  } catch {
    await fs.writeFile(GRANTS_FILE, "[]", "utf8");
  }
}

async function readGrants() {
  await ensureStore();
  const raw = await fs.readFile(GRANTS_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw) as AccessGrant[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeGrants(grants: AccessGrant[]) {
  await ensureStore();
  await fs.writeFile(GRANTS_FILE, JSON.stringify(grants, null, 2), "utf8");
}

export async function upsertAccessGrant(email: string, purchaseReference: string) {
  const grants = await readGrants();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = grants.find((grant) => grant.email === normalizedEmail);

  if (existing) {
    existing.purchaseReference = purchaseReference;
    existing.createdAt = new Date().toISOString();
  } else {
    grants.push({
      email: normalizedEmail,
      provider: "stripe",
      purchaseReference,
      createdAt: new Date().toISOString()
    });
  }

  await writeGrants(grants);
}

export async function hasAccessGrant(email: string) {
  const grants = await readGrants();
  const normalizedEmail = email.trim().toLowerCase();
  return grants.some((grant) => grant.email === normalizedEmail);
}
