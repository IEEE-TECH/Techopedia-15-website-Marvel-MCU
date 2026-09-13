/**
 * TECHOPEDIA LEVEL 15 // IEEE SIESGST
 * GOOGLE APPS SCRIPT WEBHOOK FOR REAL-TIME SYNC
 *
 * HOW TO SETUP IN 2 MINUTES:
 * 1. Open your Google Sheet.
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any default code, paste this entire file, and click Save (💾).
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 * 6. Set Description: "Techopedia 15 Realtime Sync".
 * 7. Set "Execute as": "Me".
 * 8. Set "Who has access": "Anyone" (so your website server can push data).
 * 9. Click "Deploy", authorize permissions, and copy the Web App URL!
 * 10. Add it to your .env.local file:
 *     GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
 */

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Registrations Sheet
  let regSheet = ss.getSheetByName("Registrations");
  if (!regSheet) {
    regSheet = ss.insertSheet("Registrations");
    regSheet.appendRow([
      "Timestamp",
      "Agent ID",
      "Full Name",
      "PRN",
      "Email Address",
      "WhatsApp / Phone",
      "College / Institution",
      "Team Name",
      "Team Size",
      "Event Domain",
      "Total Points",
      "Digital Pass URL"
    ]);
    regSheet.getRange(1, 1, 1, 12).setBackground("#ed1d24").setFontColor("#ffffff").setFontWeight("bold");
    regSheet.setFrozenRows(1);
  }

  // 2. Points & Game Log Sheet
  let logSheet = ss.getSheetByName("Points Log");
  if (!logSheet) {
    logSheet = ss.insertSheet("Points Log");
    logSheet.appendRow([
      "Timestamp",
      "Agent ID",
      "PRN",
      "Agent Name",
      "Activity / Game",
      "Points Awarded",
      "New Total Points",
      "Scanned By Desk"
    ]);
    logSheet.getRange(1, 1, 1, 8).setBackground("#ffd700").setFontColor("#000000").setFontWeight("bold");
    logSheet.setFrozenRows(1);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Thread-safe lock for high-traffic moments
    setupSheets();
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const data = JSON.parse(e.postData.contents);
    const action = data.action || "register";
    const timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    if (action === "register") {
      const regSheet = ss.getSheetByName("Registrations");
      regSheet.appendRow([
        timestamp,
        data.agentId || "",
        data.name || "",
        data.prn || "",
        data.email || "",
        data.phone || "",
        data.college || "",
        data.teamName || "Solo",
        data.teamSize || "1",
        data.domain || "",
        data.points || 100,
        data.dashboardUrl || ""
      ]);

      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", message: "Registered & Synced to Google Sheet", agentId: data.agentId })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "award_points") {
      const logSheet = ss.getSheetByName("Points Log");
      const regSheet = ss.getSheetByName("Registrations");

      // Append to Points Log
      logSheet.appendRow([
        timestamp,
        data.agentId || "",
        data.prn || "",
        data.name || "",
        data.activityTitle || "Game Activity",
        data.pointsAwarded || 0,
        data.totalPoints || 0,
        data.scannedBy || "Game Stall Scanner"
      ]);

      // Update Total Points in Registrations Sheet for this Agent/PRN
      const regData = regSheet.getDataRange().getValues();
      for (let i = 1; i < regData.length; i++) {
        if (regData[i][1] === data.agentId || regData[i][3] === data.prn) {
          regSheet.getRange(i + 1, 11).setValue(data.totalPoints);
          break;
        }
      }

      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", message: "Points Awarded & Synced to Google Sheet", totalPoints: data.totalPoints })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Unknown action" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Techopedia 15 Google Sheets Sync Engine Online.");
}
