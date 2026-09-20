/**
 * Node.js CLI Script: Sync Supabase to Google Sheets
 * Run with: npm run sync:sheets
 */

import fs from "node:fs";
import path from "node:path";

// Auto-read .env.local if not already in process.env
if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          if (key && val && !process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  } catch {}
}

const SUPABASE_URL = "https://nxfyiprcojubhsinsvkx.supabase.co";
const SUPABASE_KEY = "sb_publishable_hNQ-PygG36ZUr4bSaD99Yg_mwTkoPpj";

async function main() {
  console.log("⚡ Fetching all records from Supabase PostgreSQL...");

  const [studentsRes, txRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/students?select=*&order=points.desc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    }),
    fetch(`${SUPABASE_URL}/rest/v1/point_transactions?select=*&order=created_at.desc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    })
  ]);

  if (!studentsRes.ok) {
    console.error("❌ Failed to query students from Supabase:", studentsRes.status);
    process.exit(1);
  }

  const students = await studentsRes.json();
  const tx = txRes.ok ? await txRes.json() : [];

  console.log(`✅ Fetched ${students.length} participants & ${tx.length} transactions from Supabase.`);

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("ℹ️ GOOGLE_SHEETS_WEBHOOK_URL is not set in environment.");
    console.log("   Data is ready to sync whenever Webhook URL is supplied.");
    return;
  }

  console.log("🚀 Pushing bulk payload to Google Sheets Webhook...");
  const pushRes = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "bulk_sync",
      participants: students.map(s => ({
        agentId: s.agent_id,
        name: s.name,
        prn: s.prn,
        email: s.email,
        phone: s.phone || "",
        college: s.college || "",
        teamName: s.team_name || "",
        teamSize: s.team_size || "1",
        domain: s.domain,
        points: s.points || 100,
        checkedIn: Boolean(s.checked_in),
        checkedInAt: s.checked_in_at || null,
        checkedInBy: s.checked_in_by || null,
        dashboardUrl: `https://techopedia15.vercel.app/dashboard/${s.agent_id}`,
        registeredAt: s.registered_at,
      })),
      transactions: tx.map(t => ({
        agentId: t.agent_id,
        activityTitle: t.reason,
        pointsAwarded: t.points,
        totalPoints: 0,
        scannedBy: t.awarded_by,
        createdAt: t.created_at,
      })),
    })
  });

  const pushJson = await pushRes.json().catch(() => null);
  console.log("✅ Google Sheets Response:", pushJson || pushRes.statusText);
}

main().catch(console.error);
