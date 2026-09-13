import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateQrCodeDataUrl } from "@/lib/qrcode";
import { syncToGoogleSheets } from "@/lib/sheets";
import { sendRegistrationEmail } from "@/lib/mailer";
import {
  cleanText,
  getClientIp,
  isValidEmail,
  isValidPhone,
  isValidPrn,
  rateLimit,
} from "@/lib/security";

function getDomainCodeName(domain: string): string {
  const d = domain.toLowerCase();
  if (d.includes("code") || d.includes("conquest")) return "STARK";
  if (d.includes("cyber") || d.includes("ctf")) return "PANTHER";
  if (d.includes("robo") || d.includes("blitz")) return "WARMACHINE";
  if (d.includes("pixel") || d.includes("craft")) return "SCARLET";
  if (d.includes("paper") || d.includes("expo")) return "BANNER";
  if (d.includes("sports") || d.includes("valorant") || d.includes("bgmi")) return "THOR";
  return "AVGR";
}

export async function POST(req: NextRequest) {
  try {
    // Rate-limit: 5 registration attempts per IP per 10 minutes.
    const limited = rateLimit(`register:${getClientIp(req)}`, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }
    const { name, prn, email, phone, college, teamName, teamSize, domain } = body as Record<string, unknown>;

    if (!name || !prn || !email) {
      return NextResponse.json(
        { success: false, error: "Name, PRN, and Email are mandatory fields." },
        { status: 400 }
      );
    }

    const cleanName = cleanText(name, 80);
    const cleanPrn = cleanText(prn, 32).toUpperCase();
    const cleanEmail = cleanText(email, 254).toLowerCase();
    const cleanPhone = cleanText(phone, 20);
    const cleanCollege = cleanText(college, 120) || "SIES Graduate School of Technology";
    const cleanTeamName = cleanText(teamName, 60) || "Avengers Initiative";
    const cleanDomain = cleanText(domain, 60) || "Code Conquest";

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid full name." },
        { status: 400 }
      );
    }
    if (!isValidPrn(cleanPrn)) {
      return NextResponse.json(
        { success: false, error: "PRN must be 3-32 letters/digits/hyphens." },
        { status: 400 }
      );
    }
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    if (cleanPhone && !isValidPhone(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    const cleanTeamSize = Math.min(10, Math.max(1, parseInt(String(teamSize), 10) || 1));

    // Check if participant already registered by PRN or email — either one
    // uniquely identifies a person, so both must be checked to stop
    // duplicate registrations (previously only PRN was checked).
    const existingByPrn = db.getParticipantByPrn(cleanPrn);
    const existingByEmail = existingByPrn ? null : db.getParticipantByEmail(cleanEmail);
    const existing = existingByPrn || existingByEmail;
    if (existing) {
      return NextResponse.json({
        success: true,
        isExisting: true,
        message: "Credentials already active for this PRN or email.",
        participant: existing,
        dashboardUrl: `/dashboard/${existing.agentId}`,
      });
    }

    // Generate unique Agent ID
    const codename = getDomainCodeName(cleanDomain);
    const prnSuffix = cleanPrn.replace(/[^A-Z0-9]/g, "").slice(-4) || Math.floor(1000 + Math.random() * 9000).toString();
    const agentId = `TECH15-${codename}-${prnSuffix}`;

    // Construct Dashboard URL and QR Code Payload
    const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3000";
    const dashboardUrl = `${origin}/dashboard/${agentId}`;
    const qrPayload = JSON.stringify({
      v: "TECHOPEDIA-15",
      id: agentId,
      prn: cleanPrn,
      name: cleanName,
      url: dashboardUrl,
    });

    // Generate QR Code
    const qrCodeUrl = await generateQrCodeDataUrl(qrPayload);

    // Persist to Database with initial 100 PTS clearance bonus
    const newParticipant = await db.addParticipant({
      agentId,
      name: cleanName,
      prn: cleanPrn,
      email: cleanEmail,
      phone: cleanPhone,
      college: cleanCollege,
      teamName: cleanTeamName,
      teamSize: String(cleanTeamSize),
      domain: cleanDomain,
      points: 100, // Starting clearance points
      qrCodeUrl,
    });

    // Asynchronously dispatch to Google Sheets webhook (non-blocking)
    syncToGoogleSheets({
      action: "register",
      agentId,
      name: newParticipant.name,
      prn: newParticipant.prn,
      email: newParticipant.email,
      phone: newParticipant.phone,
      college: newParticipant.college,
      teamName: newParticipant.teamName,
      teamSize: newParticipant.teamSize,
      domain: newParticipant.domain,
      points: newParticipant.points,
      dashboardUrl,
    }).catch((err) => console.error("Sheets sync error:", err));

    // Send confirmation email with QR code
    const emailResult = await sendRegistrationEmail({
      name: newParticipant.name,
      prn: newParticipant.prn,
      email: newParticipant.email,
      agentId: newParticipant.agentId,
      domain: newParticipant.domain,
      teamName: newParticipant.teamName,
      qrCodeDataUrl: qrCodeUrl,
      dashboardUrl,
    });

    return NextResponse.json({
      success: true,
      participant: newParticipant,
      dashboardUrl,
      emailSent: emailResult.success,
      emailPreviewUrl: emailResult.previewUrl,
    });
  } catch (err: unknown) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
