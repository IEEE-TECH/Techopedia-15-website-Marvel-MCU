"use client";

import React, { useState, useEffect } from "react";
import { sound } from "@/lib/audio";
import styles from "./games.module.css";

interface Snippet {
  id: number;
  language: string;
  code: string;
  bugLine: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const SNIPPETS: Snippet[] = [
  {
    id: 1,
    language: "JavaScript",
    code: `function computeEnergy(core) {
  let total = 0;
  for (let i = 0; i <= core.length; i++) {
    total += core[i].yield;
  }
  return total;
}`,
    bugLine: 3,
    question: "What causes the Runtime Exception / NaN in computeEnergy?",
    options: [
      "i <= core.length causes an off-by-one Out of Bounds / undefined error",
      "let total should be const",
      "core.length is a function call",
      "yield is a reserved keyword in JS"
    ],
    correctAnswer: 0,
    explanation: "Looping with i <= core.length accesses core[core.length] which is undefined, resulting in undefined.yield causing a TypeError."
  },
  {
    id: 2,
    language: "Python",
    code: `def activate_suit(power, mode="flight"):
    if power = 100:
        return f"{mode} mode armed at maximum efficiency"
    return "Insufficient power"`,
    bugLine: 2,
    question: "Identify the syntax bug on line 2:",
    options: [
      "Missing return type hint",
      "Using assignment '=' instead of comparison '=='",
      "mode parameter must be an integer",
      "f-strings are not allowed inside if blocks"
    ],
    correctAnswer: 1,
    explanation: "In Python, equality comparison requires '==' instead of single '=' assignment."
  },
  {
    id: 3,
    language: "C++",
    code: `int* allocateArcReactor() {
    int powerOutput = 9000;
    return &powerOutput;
}`,
    bugLine: 3,
    question: "What critical memory bug exists in allocateArcReactor?",
    options: [
      "Missing semicolon on line 1",
      "Returning pointer to local stack variable which becomes dangling",
      "powerOutput exceeds maximum integer size",
      "int* cannot point to 9000"
    ],
    correctAnswer: 1,
    explanation: "Local variables on the stack are destroyed when the function returns, leaving a dangling pointer."
  },
  {
    id: 4,
    language: "JavaScript / React",
    code: `function ReactorHUD({ levels }) {
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);
}`,
    bugLine: 4,
    question: "What potential issue occurs with fetchStatus in dependency array?",
    options: [
      "fetchStatus must be an async generator",
      "If not wrapped in useCallback, re-renders create new function reference causing infinite loop",
      "React forbids functions inside dependency arrays",
      "useEffect cannot be capitalized"
    ],
    correctAnswer: 1,
    explanation: "Unmemoized function references recreate on every render, triggering useEffect infinitely."
  },
  {
    id: 5,
    language: "Python",
    code: `def append_nanite(entry, registry=[]):
    registry.append(entry)
    return registry`,
    bugLine: 1,
    question: "What is the classic Python gotcha in append_nanite?",
    options: [
      "Mutable default argument 'registry=[]' is shared across all function calls",
      "Python lists do not support .append()",
      "entry cannot be a dictionary",
      "Missing self parameter"
    ],
    correctAnswer: 0,
    explanation: "Default arguments in Python are evaluated once at definition time, so the same list instance is reused across invocations."
  }
];

export default function BugBlitzGame() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("tech15_bugblitz_highscore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      setGameState("gameover");
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("tech15_bugblitz_highscore", String(score));
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, highScore]);

  const startGame = () => {
    setGameState("playing");
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);

    const isCorrect = idx === SNIPPETS[currentIndex].correctAnswer;
    if (isCorrect) {
      const points = 100 + streak * 25;
      setScore((s) => s + points);
      setStreak((st) => st + 1);
      sound.playSuccess();
    } else {
      setStreak(0);
      sound.playError();
    }

    setTimeout(() => {
      setSelectedOption(null);
      setShowFeedback(false);
      if (currentIndex + 1 < SNIPPETS.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        // cycle snippets
        setCurrentIndex(0);
      }
    }, 1200);
  };

  const current = SNIPPETS[currentIndex];

  return (
    <div className={styles.gameBox}>
      <div className={styles.gameHeader}>
        <div className={styles.gameTitleRow}>
          <span className={styles.tag}>STARK SPEED CODER</span>
          <h3 className={styles.title}>Quantum Bug Blitz</h3>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <span>TIME</span>
            <b style={{ color: timeLeft < 10 ? "#ff3366" : "#00ff9c" }}>{timeLeft}s</b>
          </div>
          <div className={styles.statPill}>
            <span>SCORE</span>
            <b>{score}</b>
          </div>
          <div className={styles.statPill}>
            <span>STREAK</span>
            <b style={{ color: "#ffd700" }}>{streak}x</b>
          </div>
          <div className={styles.statPill}>
            <span>BEST</span>
            <b>{highScore}</b>
          </div>
        </div>
      </div>

      {gameState === "idle" && (
        <div className={styles.centerCard}>
          <h4>30-Second Rapid-Fire Debugger</h4>
          <p>
            Scan real-world code snippets in JavaScript, Python, C++, and React. Identify and neutralize bugs before the quantum clock runs out!
          </p>
          <button className={styles.primaryBtn} onClick={startGame}>
            ▸ INITIATE DEBUG SPRINT
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <div className={styles.playArena}>
          <div className={styles.codeWindow}>
            <div className={styles.codeHeader}>
              <span className={styles.codeLang}>{current.language}</span>
              <span className={styles.codeBadge}>Snippet #{currentIndex + 1}</span>
            </div>
            <pre className={styles.codeContent}>
              <code>{current.code}</code>
            </pre>
          </div>

          <div className={styles.questionText}>{current.question}</div>

          <div className={styles.optionsGrid}>
            {current.options.map((opt, idx) => {
              let optClass = styles.optionBtn;
              if (showFeedback) {
                if (idx === current.correctAnswer) optClass += ` ${styles.correct}`;
                else if (idx === selectedOption) optClass += ` ${styles.wrong}`;
              }
              return (
                <button
                  key={idx}
                  className={optClass}
                  onClick={() => handleSelect(idx)}
                  disabled={showFeedback}
                >
                  <span className={styles.optLetter}>{String.fromCharCode(65 + idx)}</span>
                  <span className={styles.optText}>{opt}</span>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={styles.feedbackBanner}>
              {selectedOption === current.correctAnswer ? (
                <span className={styles.correctText}>[ OK ] BUG NEUTRALIZED! (+{100 + (streak - 1) * 25} PTS)</span>
              ) : (
                <span className={styles.wrongText}>[ ERR ] CRITICAL ERROR: {current.explanation}</span>
              )}
            </div>
          )}
        </div>
      )}

      {gameState === "gameover" && (
        <div className={styles.centerCard}>
          <h4 style={{ color: "#00ff9c" }}>MISSION COMPLETE</h4>
          <p>
            Final Score: <strong>{score} PTS</strong> | Max Streak: <strong>{streak}x</strong>
          </p>
          <div className={styles.rankBadge}>
            {score >= 400
              ? "[ RANK S // MULTIVERSE ARCH-CODER ]"
              : score >= 200
              ? "[ RANK A // QUANTUM SENIOR DEVELOPER ]"
              : "[ RANK B // STARK LAB CADET ]"}
          </div>
          <button className={styles.primaryBtn} onClick={startGame}>
            REPLAY SPRINT
          </button>
        </div>
      )}
    </div>
  );
}
