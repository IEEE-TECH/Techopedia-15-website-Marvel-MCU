"use client";

/**
 * Offline-resilient queue for point awards made on `/scanner`.
 *
 * Event-day WiFi at a stall is unreliable. If a coordinator scans a pass and
 * the award POST fails because the device is offline (or the request itself
 * throws — a dropped connection, not a server rejection), the award is
 * persisted to localStorage instead of just erroring out. It's retried
 * automatically the moment the browser regains connectivity, and survives a
 * page reload or the coordinator closing the tab in the meantime.
 *
 * Server-side rejections (bad token, unknown agent, points cap) are NOT
 * queued — those aren't going to succeed on retry, so they surface as an
 * immediate error instead of silently failing again and again in the queue.
 */

const STORAGE_KEY = "techopedia15_scan_queue";

export interface QueuedAward {
  id: string;
  identifier: string;
  points: number;
  activityTitle: string;
  scannedBy: string;
  participantName: string;
  queuedAt: string;
  attempts: number;
}

function readQueue(): QueuedAward[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedAward[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedAward[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full/unavailable (private mode) — the award still happened in
    // the UI for this session, it just won't survive a reload. Not worth
    // surfacing as an error mid-scan.
  }
}

export function getQueue(): QueuedAward[] {
  return readQueue();
}

export function enqueueAward(award: Omit<QueuedAward, "id" | "queuedAt" | "attempts">): QueuedAward {
  const entry: QueuedAward = {
    ...award,
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    queuedAt: new Date().toISOString(),
    attempts: 0,
  };
  const queue = readQueue();
  queue.push(entry);
  writeQueue(queue);
  return entry;
}

function removeFromQueue(id: string): void {
  writeQueue(readQueue().filter((item) => item.id !== id));
}

export interface FlushResult {
  succeeded: QueuedAward[];
  failed: { award: QueuedAward; error: string }[];
}

/**
 * Attempts to send every queued award. A network-level failure (offline,
 * timeout) leaves the item in the queue for the next flush. A server
 * response — success or rejection — always removes it from the queue, since
 * a rejection (bad token, agent gone) won't fix itself by retrying.
 */
export async function flushQueue(orgToken: string): Promise<FlushResult> {
  const queue = readQueue();
  const result: FlushResult = { succeeded: [], failed: [] };

  for (const award of queue) {
    try {
      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-organizer-token": orgToken },
        body: JSON.stringify({
          action: "award",
          identifier: award.identifier,
          points: award.points,
          activityTitle: award.activityTitle,
          scannedBy: award.scannedBy,
        }),
      });

      if (res.ok) {
        removeFromQueue(award.id);
        result.succeeded.push(award);
      } else {
        // Server actively rejected it — won't succeed by retrying blindly.
        const data = await res.json().catch(() => ({}));
        removeFromQueue(award.id);
        result.failed.push({ award, error: data.error || `HTTP ${res.status}` });
      }
    } catch {
      // Network-level failure — still offline/unreachable. Bump the attempt
      // counter and leave it queued for the next flush.
      const current = readQueue();
      const idx = current.findIndex((item) => item.id === award.id);
      if (idx !== -1) {
        current[idx].attempts += 1;
        writeQueue(current);
      }
      // Stop trying the rest this round — if one request failed on the
      // network, the others almost certainly will too, and there's no
      // point burning through them one by one.
      break;
    }
  }

  return result;
}
