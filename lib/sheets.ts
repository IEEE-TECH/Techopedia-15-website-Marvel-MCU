/**
 * Real-time Google Sheets Webhook Dispatcher
 * Pushes registrations and point allocations to the team's deployed Google Sheet Web App.
 */

export interface SheetRegisterPayload {
  action: "register";
  agentId: string;
  name: string;
  prn: string;
  email: string;
  phone: string;
  college: string;
  teamName: string;
  teamSize: string;
  domain: string;
  points: number;
  dashboardUrl: string;
  timestamp?: string;
}

export interface SheetAwardPayload {
  action: "award_points";
  agentId: string;
  prn: string;
  name: string;
  activityTitle: string;
  pointsAwarded: number;
  totalPoints: number;
  scannedBy?: string;
  timestamp?: string;
}

export async function syncToGoogleSheets(
  payload: SheetRegisterPayload | SheetAwardPayload
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    // If webhook is not configured yet, silently pass so user registration is never blocked
    return { success: true, error: "GOOGLE_SHEETS_WEBHOOK_URL not configured yet" };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      }),
      // Apps Script webhooks follow 302 redirects automatically
      redirect: "follow",
    });

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("⚠️ Google Sheets Webhook Sync Notice:", msg);
    return { success: false, error: msg };
  }
}
