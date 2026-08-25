"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BugBlitzGame from "./BugBlitzGame";
import MatrixMemoryGame from "./MatrixMemoryGame";
import TerminalModal from "../ui/TerminalModal";
import { CloseIcon } from "../ui/HudIcon";
import { sound } from "@/lib/audio";
import styles from "./miniGamesModal.module.css";

interface MiniGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "ctf" | "bugblitz" | "matrix" | "quiz";
}

const QUIZ_QUESTIONS = [
  {
    q: "Which quantum computing phenomenon allows qubits to exist in multiple states simultaneously?",
    options: ["Superposition", "Entanglement", "Quantum Tunneling", "Wave Collapse"],
    correct: 0,
    fact: "Superposition allows quantum systems to evaluate exponentially large states in parallel."
  },
  {
    q: "In cryptography, what makes asymmetric RSA encryption secure against rapid brute-force?",
    options: ["Elliptic curve hashing", "Difficulty of prime factorization", "Symmetric XOR substitution", "Dynamic Salt Rotation"],
    correct: 1,
    fact: "RSA relies on the computational difficulty of factoring the product of two large prime numbers."
  },
  {
    q: "What is the primary architectural advantage of React 19's Server Components?",
    options: ["Zero bundle size overhead on the client for static server logic", "Automatic CSS compiling", "Eliminating HTML tags", "Client-side database queries"],
    correct: 0,
    fact: "RSC allows code to execute exclusively on the server, avoiding extra JavaScript sent to the client browser."
  },
  {
    q: "Which time complexity represents the optimal sorting algorithm for general comparison-based data?",
    options: ["O(N)", "O(N log N)", "O(log N)", "O(N²)"],
    correct: 1,
    fact: "The theoretical lower bound for comparison sorts (like Merge Sort & Heap Sort) is O(N log N)."
  },
  {
    q: "In Marvel MCU lore, which synthetic vibranium AI body gave birth to Vision?",
    options: ["Cerebro", "Helen Cho's Regeneration Cradle & Mind Stone", "Pym Particle Collider", "Zola's Memory Tape"],
    correct: 1,
    fact: "Dr. Helen Cho's synthetic tissue cradle combined with Stark's JARVIS code and the Mind Stone created Vision."
  }
];

export default function MiniGamesModal({ isOpen, onClose, defaultTab = "bugblitz" }: MiniGamesModalProps) {
  const [activeTab, setActiveTab] = useState<"ctf" | "bugblitz" | "matrix" | "quiz">(defaultTab);

  // Quiz state
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleQuizAnswer = (idx: number) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);

    if (idx === QUIZ_QUESTIONS[quizIdx].correct) {
      setQuizScore((s) => s + 1);
      sound.playSuccess();
    } else {
      sound.playError();
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setAnswered(false);
      if (quizIdx + 1 < QUIZ_QUESTIONS.length) {
        setQuizIdx((i) => i + 1);
      } else {
        setQuizFinished(true);
      }
    }, 1200);
  };

  const restartQuiz = () => {
    setQuizIdx(0);
    setQuizScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 28,
              mass: 0.8,
            }}
          >
            <div className={styles.headerBar}>
              <div className={styles.titleInfo}>
                <span className={styles.badge}>LEVEL 15 MULTIVERSE ARCADE</span>
                <h2 className={styles.mainTitle}>Techopedia Mini-Games &amp; CTF</h2>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  sound.playBlip(600, 0.04);
                  onClose();
                }}
                aria-label="Close Arcade"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Tab switcher */}
            <div className={styles.tabNav}>
              <button
                className={`${styles.tabBtn} ${activeTab === "bugblitz" ? styles.tabBtnActive : ""}`}
                onClick={() => {
                  sound.playBlip(750, 0.03);
                  setActiveTab("bugblitz");
                }}
              >
                ▸ Quantum Bug Blitz
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "matrix" ? styles.tabBtnActive : ""}`}
                onClick={() => {
                  sound.playBlip(850, 0.03);
                  setActiveTab("matrix");
                }}
              >
                ▸ Tesseract Memory
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "ctf" ? styles.tabBtnActive : ""}`}
                onClick={() => {
                  sound.playBlip(950, 0.03);
                  setActiveTab("ctf");
                }}
              >
                ▸ Stark CTF Terminal
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "quiz" ? styles.tabBtnActive : ""}`}
                onClick={() => {
                  sound.playBlip(1050, 0.03);
                  setActiveTab("quiz");
                }}
              >
                ▸ Jarvis Multiverse Quiz
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.bodyContent}>
              {activeTab === "bugblitz" && <BugBlitzGame />}
              {activeTab === "matrix" && <MatrixMemoryGame />}
              {activeTab === "ctf" && (
                <div className={styles.embeddedTerminal}>
                  <TerminalModal isOpen={true} onClose={() => {}} isEmbedded={true} />
                </div>
              )}
              {activeTab === "quiz" && (
                <div className={styles.quizBox}>
                  <div className={styles.quizHead}>
                    <span className={styles.quizBadge}>Question {quizIdx + 1} of {QUIZ_QUESTIONS.length}</span>
                    <span className={styles.scoreText}>Score: {quizScore}/{QUIZ_QUESTIONS.length}</span>
                  </div>

                  {!quizFinished ? (
                    <div className={styles.quizCard}>
                      <h3 className={styles.question}>{QUIZ_QUESTIONS[quizIdx].q}</h3>
                      <div className={styles.quizOptions}>
                        {QUIZ_QUESTIONS[quizIdx].options.map((opt, oIdx) => {
                          let btnCls = styles.quizOption;
                          if (answered) {
                            if (oIdx === QUIZ_QUESTIONS[quizIdx].correct) btnCls += ` ${styles.optCorrect}`;
                            else if (oIdx === selectedAnswer) btnCls += ` ${styles.optWrong}`;
                          }
                          return (
                            <button
                              key={oIdx}
                              className={btnCls}
                              onClick={() => handleQuizAnswer(oIdx)}
                              disabled={answered}
                            >
                              <span className={styles.optNum}>{oIdx + 1}</span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                      {answered && (
                        <div className={styles.factBox}>
                          // <strong>JARVIS INTEL:</strong> {QUIZ_QUESTIONS[quizIdx].fact}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.quizEnd}>
                      <h4>MULTIVERSE QUIZ COMPLETE</h4>
                      <p>You scored <strong>{quizScore} out of {QUIZ_QUESTIONS.length}</strong> correct!</p>
                      <div className={styles.clearanceTier}>
                        {quizScore >= 4
                          ? "[ LEVEL 15 // TECH TITAN CLEARANCE ]"
                          : quizScore >= 2
                          ? "[ SENIOR LAB SPECIALIST ]"
                          : "[ ACADEMY RECRUIT ]"}
                      </div>
                      <button className={styles.quizRestartBtn} onClick={restartQuiz}>
                        RETRY QUIZ
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
