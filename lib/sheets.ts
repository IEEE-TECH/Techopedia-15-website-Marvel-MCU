/**
 * Real-time Google Sheets Webhook Dispatcher
 * Pushes registrations, point allocations, and check-ins to the team's deployed Google Sheet Web App in real time.
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
  checkedIn?: boolean;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
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

export interface SheetCheckinPayload {
  action: "check_in";
  agentId: string;
  prn: string;
  name: string;
  domain?: string;
  checkedInBy?: string;
  timestamp?: string;
}

export interface SheetBulkSyncPayload {
  action: "bulk_sync";
  participants: Array<{
    agentId: string;
    name: string;
    prn: string;
    email: string;
    phone?: string;
    college?: string;
    teamName?: string;
    teamSize?: string;
    domain: string;
    points: number;
    checkedIn?: boolean;
    checkedInAt?: string | null;
    checkedInBy?: string | null;
    dashboardUrl?: string;
    registeredAt?: string;
  }>;
  transactions?: Array<{
    agentId: string;
    prn?: string;
    name?: string;
    activityTitle?: string;
    pointsAwarded?: number;
    totalPoints?: number;
    scannedBy?: string;
    createdAt?: string;
  }>;
  timestamp?: string;
}

export interface SheetTestPayload {
  action: "test" | "ping";
  timestamp?: string;
}

export type SheetPayload =
  | SheetRegisterPayload
  | SheetAwardPayload
  | SheetCheckinPayload
  | SheetBulkSyncPayload
  | SheetTestPayload;

export interface SheetSyncResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: Record<string, unknown>;
}

export function getGoogleSheetsWebhookUrl(): string | null {
  return (
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.GOOGLE_SHEETS_SCRIPT_URL ||
    null
  );
}

/**
 * Dispatches a real-time event or bulk sync payload to Google Sheets Apps Script.
 */
export async function syncToGoogleSheets(
  payload: SheetPayload
): Promise<SheetSyncResult> {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) {
    return {
      success: true,
      message: "Google Sheets Webhook not configured in environment.",
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        timestamp:
          payload.timestamp ||
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      }),
      // Apps Script webhooks follow 302 redirects automatically
      redirect: "follow",
    });

    if (!res.ok) {
      return {
        success: false,
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const json = await res.json().catch(() => null);
    if (json && json.status === "error") {
      return {
        success: false,
        error: json.message || "Apps script returned error status.",
      };
    }

    return {
      success: true,
      message: json?.message || "Successfully synced to Google Sheets.",
      data: json,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("⚠️ Google Sheets Webhook Sync Notice:", msg);
    return { success: false, error: msg };
  }
}

/**
 * Tests connection with deployed Google Sheets Apps Script webhook.
 */
export async function testGoogleSheetsConnection(): Promise<SheetSyncResult> {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) {
    return {
      success: false,
      error: "GOOGLE_SHEETS_WEBHOOK_URL is not configured in .env.local",
    };
  }

  return syncToGoogleSheets({ action: "test" });
}
