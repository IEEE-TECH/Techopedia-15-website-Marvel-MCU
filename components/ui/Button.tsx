"use client";

import React from "react";
import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import { sound } from "@/lib/audio";
import styles from "./button.module.css";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "gold" | "ghost" | "cyan";
  size?: "sm" | "md" | "lg";
  radius?: "sm" | "pill";
  href?: string;
  external?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  radius = "sm",
  href,
  external,
  className = "",
  onClick,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.btn,
    styles[variant],
    styles[size],
    radius === "pill" ? styles.radiusPill : styles.radiusSm,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    sound.playBlip(720, 0.03);
    onClick?.(e);
  };

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.96 },
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
    onClick: handleClick,
  };

  if (href) {
    if (external) {
      return (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classNames}
          {...motionProps}
          {...(props as any)}
        >
          {children}
        </motion.a>
      );
    }
    return (
      <Link href={href} legacyBehavior passHref>
        <motion.a className={classNames} {...motionProps} {...(props as any)}>
          {children}
        </motion.a>
      </Link>
    );
  }

  return (
    <motion.button className={classNames} {...motionProps} {...props}>
      {children}
    </motion.button>
  );
}
