/**
 * TECHOPEDIA LEVEL 15 // IEEE SIESGST
 * FULL SUPABASE <-> GOOGLE SHEETS DUAL-SYNC ENGINE
 *
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1sKzIh_jD7QEvnZzFQ31TlEcOGXe7vbNhBvOaBrtFiaI/edit
 */

const SUPABASE_CONFIG = {
  url: "https://nxfyiprcojubhsinsvkx.supabase.co",
  anonKey: "sb_publishable_hNQ-PygG36ZUr4bSaD99Yg_mwTkoPpj"
};

const SPREADSHEET_ID = "1sKzIh_jD7QEvnZzFQ31TlEcOGXe7vbNhBvOaBrtFiaI";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚡ Techopedia 15")
    .addItem("🔄 Sync All from Supabase Now", "manualSyncFromSupabase")
    .addSeparator()
    .addItem("⏰ Enable Auto-Sync (Every 5 Mins)", "installAutoSyncTrigger")
    .addItem("🛑 Disable Auto-Sync", "removeAutoSyncTrigger")
    .addSeparator()
    .addItem("📊 Format & Style Sheets", "setupSheets")
    .addToUi();
}

function manualSyncFromSupabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    ss.toast("Connecting to Supabase PostgreSQL...", "Syncing", 5);
    const res = syncDirectlyFromSupabase();
    ss.toast(`✓ Synced ${res.participants} participants & ${res.transactions} point logs!`, "Success", 8);
  } catch (err) {
    SpreadsheetApp.getUi().alert("Sync Error: " + err.toString());
  }
}

function syncDirectlyFromSupabase() {
  const { regSheet, logSheet, checkinSheet } = setupSheets();

  // 1. Fetch Students
  const studentsUrl = `${SUPABASE_CONFIG.url}/rest/v1/students?select=*&order=points.desc`;
  const studentsRes = UrlFetchApp.fetch(studentsUrl, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_CONFIG.anonKey,
      "Authorization": `Bearer ${SUPABASE_CONFIG.anonKey}`,
    },
    muteHttpExceptions: true,
  });

  const students = JSON.parse(studentsRes.getContentText() || "[]");

  // 2. Fetch Point Transactions
  const txUrl = `${SUPABASE_CONFIG.url}/rest/v1/point_transactions?select=*&order=created_at.desc`;
  const txRes = UrlFetchApp.fetch(txUrl, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_CONFIG.anonKey,
      "Authorization": `Bearer ${SUPABASE_CONFIG.anonKey}`,
    },
    muteHttpExceptions: true,
  });

  const transactions = JSON.parse(txRes.getContentText() || "[]");

  // 3. Write Registrations Sheet
  if (students && students.length > 0) {
    const lastRow = regSheet.getLastRow();
    if (lastRow > 1) {
      regSheet.getRange(2, 1, lastRow - 1, 15).clearContent();
    }

    const rows = students.map((s) => [
      s.registered_at ? new Date(s.registered_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      s.agent_id || "",
      s.name || "",
      s.prn || "",
      s.email || "",
      s.phone || "",
      s.college || "SIES Graduate School of Technology",
      s.team_name || "Avengers Initiative",
      s.team_size || "1",
      s.domain || "Squabble",
      s.points || 100,
      s.checked_in ? "YES" : "NO",
      s.checked_in_at ? new Date(s.checked_in_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "",
      s.checked_in_by || "",
      `https://techopedia15.vercel.app/dashboard/${s.agent_id}`
    ]);

    regSheet.getRange(2, 1, rows.length, 15).setValues(rows);
    regSheet.autoResizeColumns(1, 15);
  }

  // 4. Write Points Log Sheet
  if (transactions && transactions.length > 0) {
    const lastTxRow = logSheet.getLastRow();
    if (lastTxRow > 1) {
      logSheet.getRange(2, 1, lastTxRow - 1, 8).clearContent();
    }

    const nameMap = {};
    students.forEach((s) => { nameMap[s.agent_id] = s.name; });

    const txRows = transactions.map((t) => [
      t.created_at ? new Date(t.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      t.agent_id || "",
      "",
      nameMap[t.agent_id] || t.agent_id,
      t.reason || "Stall Challenge",
      t.points || 0,
      0,
      t.awarded_by || "Admin"
    ]);

    logSheet.getRange(2, 1, txRows.length, 8).setValues(txRows);
    logSheet.autoResizeColumns(1, 8);
  }

  // 5. Write Check-in Log Sheet
  const checkedInStudents = students.filter(s => s.checked_in);
  if (checkedInStudents && checkedInStudents.length > 0) {
    const lastCkRow = checkinSheet.getLastRow();
    if (lastCkRow > 1) {
      checkinSheet.getRange(2, 1, lastCkRow - 1, 6).clearContent();
    }

    const ckRows = checkedInStudents.map(s => [
      s.checked_in_at ? new Date(s.checked_in_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      s.agent_id || "",
      s.prn || "",
      s.name || "",
      s.domain || "",
      s.checked_in_by || "Door Scanner"
    ]);

    checkinSheet.getRange(2, 1, ckRows.length, 6).setValues(ckRows);
    checkinSheet.autoResizeColumns(1, 6);
  }

  return { participants: students.length, transactions: transactions.length, checkedIn: checkedInStudents.length };
}

function installAutoSyncTrigger() {
  removeAutoSyncTrigger();
  ScriptApp.newTrigger("syncDirectlyFromSupabase").timeBased().everyMinutes(5).create();
  SpreadsheetApp.getActiveSpreadsheet().toast("✓ Google Sheets will auto-sync with Supabase every 5 minutes!", "Auto-Sync Enabled", 8);
}

function removeAutoSyncTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "syncDirectlyFromSupabase") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let regSheet = ss.getSheetByName("Registrations");
  if (!regSheet) {
    regSheet = ss.insertSheet("Registrations", 0);
    regSheet.appendRow([
      "Timestamp", "Agent ID", "Full Name", "PRN", "Email Address",
      "WhatsApp / Phone", "College / Institution", "Team Name", "Team Size",
      "Event Domain", "Total Points", "Checked In", "Checked In At", "Checked In By", "Digital Pass URL"
    ]);
    regSheet.getRange(1, 1, 1, 15).setBackground("#ed1d24").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
    regSheet.setFrozenRows(1);
    regSheet.setRowHeight(1, 35);
  }

  let logSheet = ss.getSheetByName("Points Log");
  if (!logSheet) {
    logSheet = ss.insertSheet("Points Log", 1);
    logSheet.appendRow([
      "Timestamp", "Agent ID", "PRN", "Agent Name", "Activity / Game / Stall",
      "Points Awarded", "New Total Points", "Scanned By / Desk"
    ]);
    logSheet.getRange(1, 1, 1, 8).setBackground("#d97706").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
    logSheet.setFrozenRows(1);
    logSheet.setRowHeight(1, 35);
  }

  let checkinSheet = ss.getSheetByName("Check-in Log");
  if (!checkinSheet) {
    checkinSheet = ss.insertSheet("Check-in Log", 2);
    checkinSheet.appendRow(["Timestamp", "Agent ID", "PRN", "Full Name", "Domain", "Checked In By"]);
    checkinSheet.getRange(1, 1, 1, 6).setBackground("#059669").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
    checkinSheet.setFrozenRows(1);
    checkinSheet.setRowHeight(1, 35);
  }

  return { ss, regSheet, logSheet, checkinSheet };
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { regSheet, logSheet, checkinSheet } = setupSheets();

    const data = JSON.parse(e.postData.contents || "{}");
    const action = data.action || "register";
    const timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    if (action === "register") {
      const agentId = String(data.agentId || "").trim();
      const prn = String(data.prn || "").trim();
      const regData = regSheet.getDataRange().getValues();
      let existingRow = -1;
      for (let i = 1; i < regData.length; i++) {
        if ((agentId && String(regData[i][1]).toLowerCase() === agentId.toLowerCase()) ||
            (prn && String(regData[i][3]).toLowerCase() === prn.toLowerCase())) {
          existingRow = i + 1;
          break;
        }
      }
      const row = [
        timestamp, agentId, data.name || "", prn, data.email || "", data.phone || "",
        data.college || "SIES GST", data.teamName || "Avengers Initiative", data.teamSize || "1",
        data.domain || "Squabble", Number(data.points) || 100, data.checkedIn ? "YES" : "NO",
        data.checkedInAt || "", data.checkedInBy || "", data.dashboardUrl || ""
      ];
      if (existingRow > 1) {
        regSheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
      } else {
        regSheet.appendRow(row);
      }
      return jsonResponse({ status: "success", action: "register", agentId: agentId });
    }

    if (action === "award_points") {
      logSheet.appendRow([
        timestamp, data.agentId || "", data.prn || "", data.name || "",
        data.activityTitle || "Stall Challenge", Number(data.pointsAwarded) || 0,
        Number(data.totalPoints) || 0, data.scannedBy || "Scanner Desk"
      ]);
      const regData = regSheet.getDataRange().getValues();
      for (let i = 1; i < regData.length; i++) {
        if (regData[i][1] === data.agentId || regData[i][3] === data.prn) {
          regSheet.getRange(i + 1, 11).setValue(data.totalPoints);
          break;
        }
      }
      return jsonResponse({ status: "success", action: "award_points", totalPoints: data.totalPoints });
    }

    if (action === "check_in") {
      checkinSheet.appendRow([
        timestamp, data.agentId || "", data.prn || "", data.name || "",
        data.domain || "", data.checkedInBy || "Entrance Desk"
      ]);
      const regData = regSheet.getDataRange().getValues();
      for (let i = 1; i < regData.length; i++) {
        if (regData[i][1] === data.agentId || regData[i][3] === data.prn) {
          regSheet.getRange(i + 1, 12).setValue("YES");
          regSheet.getRange(i + 1, 13).setValue(timestamp);
          regSheet.getRange(i + 1, 14).setValue(data.checkedInBy || "Desk");
          break;
        }
      }
      return jsonResponse({ status: "success", action: "check_in" });
    }

    if (action === "bulk_sync") {
      return jsonResponse(syncDirectlyFromSupabase());
    }

    if (action === "test" || action === "ping") {
      return jsonResponse({ status: "success", action: "test", message: "Google Sheets Webhook Connected!" });
    }

    return jsonResponse({ status: "error", message: "Unknown action" }, 400);
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const res = syncDirectlyFromSupabase();
    return ContentService.createTextOutput(JSON.stringify({ status: "online", syncResult: res, timestamp: new Date().toISOString() })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "online", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function jsonResponse(payload, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
