"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sound } from "@/lib/audio";
import { MODAL_SPRING, OVERLAY_FADE } from "@/lib/motion";
import styles from "./terminal.module.css";

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEmbedded?: boolean;
}

interface LogEntry {
  type: "system" | "user" | "success" | "error" | "info";
  text: string;
}

const FLAGS = {
  ch1: "TECH15{N3UR4L_R34LM}",
  ch2: "TECH15{L3V3L_15_UNL0CK3D}",
  ch3: "TECH15{CYB3R_M4ST3R}",
  ch4: "TECH15{ST4RK_QU4NTUM_C0R3}",
  ch5: "TECH15{M4TR1X_S13G3_BR34K3R}",
};

export default function TerminalModal({ isOpen, onClose, isEmbedded = false }: TerminalModalProps) {
  const [input, setInput] = useState("");
  const [solvedFlags, setSolvedFlags] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: "system", text: "==================================================" },
    { type: "system", text: " TECHOPEDIA 15.0 // STARK CYBER CTF TERMINAL v3.1" },
    { type: "system", text: " SECURITY PROTOCOL: ACTIVE [MULTIVERSE ENCRYPTION]" },
    { type: "system", text: "==================================================" },
    { type: "info", text: "Type 'help' to view available terminal commands." },
    { type: "info", text: "Type 'challenges' to view active CTF missions & ciphers." },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!isOpen) return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const newLogs: LogEntry[] = [...logs, { type: "user", text: `> ${cmd}` }];
    const parts = cmd.split(" ");
    const action = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    switch (action) {
      case "help":
        newLogs.push(
          { type: "info", text: "AVAILABLE STARK TERMINAL COMMANDS:" },
          { type: "info", text: "  help            - Display this command manual" },
          { type: "info", text: "  challenges      - List active CTF challenges & ciphers" },
          { type: "info", text: "  decode <B64>    - Decode base64 encrypted payload" },
          { type: "info", text: "  rot13 <text>    - Decode Caesar Cipher ROT13 string" },
          { type: "info", text: "  hex <hex_str>   - Convert Hexadecimal stream to ASCII" },
          { type: "info", text: "  submit <FLAG>   - Submit a captured CTF flag" },
          { type: "info", text: "  status          - Check your solver clearance status" },
          { type: "info", text: "  clear           - Clear terminal log screen" },
          { type: "info", text: "  exit            - Close terminal console" }
        );
        break;

      case "challenges":
        newLogs.push(
          { type: "info", text: "--- TECHOPEDIA 15 ACTIVE CYBER MISSIONS ---" },
          {
            type: "system",
            text: `[CH-01] BASE64 CIPHER: 'VEVDSDE1e04zVVI0TF9SMzRMTX0=' (Command: decode <str>)`,
          },
          {
            type: "system",
            text: `[CH-02] ROT13 CAESAR: 'GRPU15{Y3I3Y_15_HAY0PX3Q}' (Command: rot13 <str>)`,
          },
          {
            type: "system",
            text: `[CH-03] HEX ENCODING: '5445434831357b43594233525f4d34535433527d' (Command: hex <str>)`,
          },
          {
            type: "system",
            text: `[CH-04] BINARY QUEST: Binary string translates to flag: ${FLAGS.ch4}`,
          },
          {
            type: "system",
            text: `[CH-05] QUANTUM OVERRIDE: Submit root bypass: ${FLAGS.ch5}`,
          }
        );
        break;

      case "decode":
        if (!arg) {
          newLogs.push({ type: "error", text: "Usage: decode <base64_string>" });
        } else {
          try {
            const decoded = atob(arg);
            newLogs.push({ type: "success", text: `DECODED PAYLOAD: ${decoded}` });
          } catch {
            newLogs.push({ type: "error", text: "Failed to decode Base64 string." });
          }
        }
        break;

      case "rot13":
        if (!arg) {
          newLogs.push({ type: "error", text: "Usage: rot13 <string>" });
        } else {
          const res = arg.replace(/[a-zA-Z]/g, (c) => {
            const code = c.charCodeAt(0);
            const base = code <= 90 ? 65 : 97;
            return String.fromCharCode(((code - base + 13) % 26) + base);
          });
          newLogs.push({ type: "success", text: `ROT13 DECRYPTED: ${res}` });
        }
        break;

      case "hex":
        if (!arg) {
          newLogs.push({ type: "error", text: "Usage: hex <hex_string>" });
        } else {
          try {
            let str = "";
            const clean = arg.replace(/\s+/g, "");
            for (let i = 0; i < clean.length; i += 2) {
              str += String.fromCharCode(parseInt(clean.substr(i, 2), 16));
            }
            newLogs.push({ type: "success", text: `HEX CONVERTED ASCII: ${str}` });
          } catch {
            newLogs.push({ type: "error", text: "Invalid Hexadecimal string format." });
          }
        }
        break;

      case "status":
        newLogs.push({
          type: "info",
          text: `CLEARANCE STATUS: ${solvedFlags.length}/5 Flags Solved (${Math.round((solvedFlags.length / 5) * 100)}% Complete)`,
        });
        break;

      case "submit":
        if (!arg) {
          newLogs.push({ type: "error", text: "Usage: submit <FLAG>" });
        } else if (Object.values(FLAGS).includes(arg)) {
          if (!solvedFlags.includes(arg)) {
            const updated = [...solvedFlags, arg];
            setSolvedFlags(updated);
            newLogs.push({
              type: "success",
              text: `[ OK ] FLAG VERIFIED & CAPTURED! Progress: ${updated.length}/5 Flags Solved.`,
            });
            if (updated.length === 5) {
              newLogs.push({
                type: "success",
                text: "[ MISSION COMPLETE ] ALL 5 STARK CTF MISSIONS CLEARED! You have unlocked fast-track entry into Cyber Realm!",
              });
            }
          } else {
            newLogs.push({ type: "info", text: "Flag already registered in system." });
          }
        } else {
          newLogs.push({ type: "error", text: "[ ERR ] INVALID FLAG! ACCESS DENIED." });
        }
        break;

      case "clear":
        setLogs([]);
        setInput("");
        return;

      case "exit":
        onClose();
        return;

      default:
        newLogs.push({
          type: "error",
          text: `Command not recognized: '${action}'. Type 'help' for options.`,
        });
        break;
    }

    setLogs(newLogs);
    setInput("");
  };

  const terminalContent = (
    <div className={styles.window} onClick={(e) => e.stopPropagation()}>
      <div className={styles.titleBar}>
        <div className={styles.controls}>
          <span className={`${styles.dot} ${styles.red}`} onClick={() => { sound.playBlip(500, 0.04); onClose(); }} />
          <span className={`${styles.dot} ${styles.yellow}`} />
          <span className={`${styles.dot} ${styles.green}`} />
        </div>
        <div className={styles.titleText}>root@techopedia15:~# stark-ctf-terminal</div>
        <div className={styles.statusBadge}>
          FLAGS: {solvedFlags.length}/5
        </div>
      </div>

      <div className={styles.body}>
        {logs.map((log, index) => (
          <div key={index} className={`${styles.line} ${styles[log.type]}`}>
            {log.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleCommand} className={styles.promptLine}>
        <span className={styles.prompt}>stark@tech15:~$</span>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type command here (e.g. 'challenges', 'help')..."
          autoFocus
        />
      </form>
    </div>
  );

  if (isEmbedded) {
    return <div className={styles.embeddedContainer}>{terminalContent}</div>;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={OVERLAY_FADE}
        >
          <motion.div
            style={{ transformPerspective: 1000 }}
            initial={{ opacity: 0, scale: 0.94, y: 20, rotateX: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16, rotateX: -4 }}
            transition={MODAL_SPRING}
          >
            {terminalContent}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
