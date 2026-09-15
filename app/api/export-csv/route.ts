import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOrganizerAuth } from "@/lib/security";

export async function GET(req: NextRequest) {
  const authError = requireOrganizerAuth(req);
  if (authError) return authError;

  try {
    const participants = await db.getParticipants();

    const headers = [
      "Rank",
      "Agent ID",
      "PRN",
      "Full Name",
      "Email",
      "Phone",
      "College",
      "Team Name",
      "Team Size",
      "Domain",
      "Total Points",
      "Registered At",
    ];

    const rows = participants.map((p, idx) => [
      idx + 1,
      `"${p.agentId}"`,
      `"${p.prn}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.email}"`,
      `"${p.phone || ""}"`,
      `"${(p.college || "").replace(/"/g, '""')}"`,
      `"${(p.teamName || "").replace(/"/g, '""')}"`,
      `"${p.teamSize || "1"}"`,
      `"${(p.domain || "").replace(/"/g, '""')}"`,
      p.points,
      `"${p.registeredAt}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Techopedia_15_Participants_${Date.now()}.csv"`,
      },
    });
  } catch (err: unknown) {
    console.error("CSV export error:", err);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}
