"use client";

import React, { useState, useEffect, useRef } from "react";
import { sound } from "@/lib/audio";
import Button from "../ui/Button";
import styles from "./games.module.css";

const GRID_SIZE = 9; // 3x3 grid

export default function MatrixMemoryGame() {
  const [gameState, setGameState] = useState<"idle" | "showing" | "input" | "gameover">("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [level, setLevel] = useState(1);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [bestLevel, setBestLevel] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("tech15_matrix_bestlevel");
    if (saved) setBestLevel(parseInt(saved, 10));
  }, []);

  const startGame = () => {
    setLevel(1);
    const initialSeq = [Math.floor(Math.random() * GRID_SIZE)];
    setSequence(initialSeq);
    setPlayerStep(0);
    setGameState("showing");
    playSequence(initialSeq);
  };

  const nextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    if (nextLvl > bestLevel) {
      setBestLevel(nextLvl);
      localStorage.setItem("tech15_matrix_bestlevel", String(nextLvl));
    }
    const newSeq = [...sequence, Math.floor(Math.random() * GRID_SIZE)];
    setSequence(newSeq);
    setPlayerStep(0);
    setGameState("showing");
    setTimeout(() => {
      playSequence(newSeq);
    }, 600);
  };

  const playSequence = (seq: number[]) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(interval);
        setActivePad(null);
        setGameState("input");
        return;
      }
      const pad = seq[i];
      setActivePad(pad);
      sound.playMatrixNote(pad);
      setTimeout(() => setActivePad(null), 400);
      i++;
    }, 650);
  };

  const handlePadClick = (padIndex: number) => {
    if (gameState !== "input") return;

    setActivePad(padIndex);
    sound.playMatrixNote(padIndex);
    setTimeout(() => setActivePad(null), 250);

    if (padIndex === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      if (nextStep === sequence.length) {
        // level passed!
        sound.playSuccess();
        setGameState("showing");
        setTimeout(() => {
          nextLevel();
        }, 500);
      } else {
        setPlayerStep(nextStep);
      }
    } else {
      // failed
      sound.playError();
      setGameState("gameover");
    }
  };

  return (
    <div className={styles.gameBox}>
      <div className={styles.gameHeader}>
        <div className={styles.gameTitleRow}>
          <span className={styles.tag}>QUANTUM MEMORY GRID</span>
          <h3 className={styles.title}>Tesseract Matrix Breaker</h3>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <span>LEVEL</span>
            <b style={{ color: "#00ff9c" }}>{level}</b>
          </div>
          <div className={styles.statPill}>
            <span>SEQUENCE</span>
            <b>{playerStep}/{sequence.length || 1}</b>
          </div>
          <div className={styles.statPill}>
            <span>BEST LEVEL</span>
            <b style={{ color: "#ffd700" }}>{bestLevel}</b>
          </div>
        </div>
      </div>

      {gameState === "idle" && (
        <div className={styles.idleScreen}>
          <p>
            The Tesseract emits quantum resonance sequences. Watch the matrix pattern and replicate the exact harmonic frequency order.
          </p>
          <Button variant="primary" onClick={startGame}>
            // INITIATE SEQUENCE
          </Button>
        </div>
      )}

      {(gameState === "showing" || gameState === "input") && (
        <>
          <div className={styles.instruction}>
            {gameState === "showing" ? (
              <span style={{ color: "var(--marvel-gold)" }}>[ SYSTEM TRANSMITTING FREQUENCY... OBSERVE ]</span>
            ) : (
              <span style={{ color: "var(--success)" }}>[ REPLICATE QUANTUM SEQUENCE NOW ]</span>
            )}
          </div>

          <div className={styles.matrixGrid}>
            {Array.from({ length: GRID_SIZE }).map((_, idx) => (
              <button
                key={idx}
                className={`${styles.matrixPad} ${activePad === idx ? styles.matrixPadActive : ""}`}
                onClick={() => handlePadClick(idx)}
                disabled={gameState !== "input"}
              >
                <span className={styles.padNumber}>{`0${idx + 1}`}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {gameState === "gameover" && (
        <div className={styles.gameOverScreen}>
          <h4 style={{ color: "var(--error)" }}>HARMONIC RESONANCE COLLAPSED</h4>
          <p>You reached <strong>Level {level}</strong> in the Tesseract Matrix.</p>
          <div className={styles.actionRow}>
            <Button variant="primary" onClick={startGame}>
              // RE-ESTABLISH LINK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
