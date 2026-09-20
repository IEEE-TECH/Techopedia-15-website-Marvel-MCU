/**
 * Direct CSV Generator from Supabase PostgreSQL
 */

const SUPABASE_URL = "https://nxfyiprcojubhsinsvkx.supabase.co";
const SUPABASE_KEY = "sb_publishable_hNQ-PygG36ZUr4bSaD99Yg_mwTkoPpj";

import fs from "fs";
import path from "path";

async function exportData() {
  console.log("⚡ Fetching all records from Supabase PostgreSQL...");

  const [studentsRes, txRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/students?select=*&order=points.desc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    }),
    fetch(`${SUPABASE_URL}/rest/v1/point_transactions?select=*&order=created_at.desc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    })
  ]);

  const students = await studentsRes.json();
  const tx = txRes.ok ? await txRes.json() : [];

  // 1. Registrations CSV
  const regHeaders = [
    "Timestamp", "Agent ID", "Full Name", "PRN", "Email Address",
    "Phone", "College", "Team Name", "Team Size", "Domain",
    "Total Points", "Checked In", "Checked In At", "Checked In By", "Digital Pass URL"
  ];

  const regRows = students.map((s) => [
    `"${s.registered_at || new Date().toISOString()}"`,
    `"${s.agent_id}"`,
    `"${(s.name || "").replace(/"/g, '""')}"`,
    `"${s.prn}"`,
    `"${s.email}"`,
    `"${s.phone || ""}"`,
    `"${(s.college || "SIES GST").replace(/"/g, '""')}"`,
    `"${(s.team_name || "Avengers Initiative").replace(/"/g, '""')}"`,
    `"${s.team_size || "1"}"`,
    `"${s.domain || "Squabble"}"`,
    s.points || 100,
    s.checked_in ? "YES" : "NO",
    `"${s.checked_in_at || ""}"`,
    `"${s.checked_in_by || ""}"`,
    `"https://techopedia15.vercel.app/dashboard/${s.agent_id}"`
  ]);

  const regCsv = [regHeaders.join(","), ...regRows.map(r => r.join(","))].join("\n");
  fs.writeFileSync("Techopedia_15_Registrations.csv", regCsv);

  // 2. Points Log CSV
  const txHeaders = ["Timestamp", "Agent ID", "Points", "Activity Reason", "Awarded By"];
  const txRows = tx.map(t => [
    `"${t.created_at}"`,
    `"${t.agent_id}"`,
    t.points,
    `"${(t.reason || "").replace(/"/g, '""')}"`,
    `"${(t.awarded_by || "").replace(/"/g, '""')}"`
  ]);

  const txCsv = [txHeaders.join(","), ...txRows.map(r => r.join(","))].join("\n");
  fs.writeFileSync("Techopedia_15_Points_Log.csv", txCsv);

  console.log("✅ Created Techopedia_15_Registrations.csv");
  console.log("✅ Created Techopedia_15_Points_Log.csv");
}

exportData().catch(console.error);
