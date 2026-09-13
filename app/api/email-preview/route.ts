import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Agent IDs are always shaped "TECH15-<CODENAME>-<digits>" (see
// getDomainCodeName in app/api/register/route.ts). Requiring the full shape
// — not just a character allowlist — means a value like "..-..-..-etc" that
// happens to pass a loose allowlist but was never a real agent ID is
// rejected outright, closing off any path traversal attempt before it ever
// touches the filesystem.
const VALID_AGENT_ID = /^TECH15-[A-Z0-9-]+$/i;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return new NextResponse("Missing ?id= parameter", { status: 400 });
  }

  if (!VALID_AGENT_ID.test(id)) {
    return new NextResponse("Invalid agent ID format.", { status: 400 });
  }

  const cleanId = id.replace(/[^a-zA-Z0-9-]/g, "");
  const filePath = path.join(process.cwd(), "data", "outbox", `${cleanId}.html`);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Email preview not found for ID: " + cleanId, { status: 404 });
  }

  const html = fs.readFileSync(filePath, "utf8");
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
