"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import RegistrationModal from "./RegistrationModal";
import SiteFooter from "./SiteFooter";
import styles from "./pageshell.module.css";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const heroVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: EASE_OUT },
  }),
};

const NAV = [
  { label: "Experience", href: "/" },
  { label: "Schedule", href: "/schedule" },
  { label: "Team", href: "/team" },
  { label: "Sponsors", href: "/sponsors" },
];

/**
 * The chrome for every non-cinematic page. The landing route is a scroll-jacked
 * film with its own fixed header/footer, so these content pages get plain,
 * normally-scrolling chrome instead — same dark-green language, no GSAP.
 */
export default function PageShell({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className={styles.page}>
      <span className={styles.grid} aria-hidden />
      <span className={styles.scanline} aria-hidden />
      <span className={`${styles.hudCorner} ${styles.hudTl}`} aria-hidden />
      <span className={`${styles.hudCorner} ${styles.hudTr}`} aria-hidden />
      <span className={`${styles.hudCorner} ${styles.hudBl}`} aria-hidden />
      <span className={`${styles.hudCorner} ${styles.hudBr}`} aria-hidden />

      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden />
          <span className={styles.brandText}>
            TECHOPEDIA<b>LEVEL 15</b>
          </span>
        </Link>

        <span className={styles.navBracket} aria-hidden>[</span>
        <nav className={styles.nav}>
          {NAV.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname?.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              >
                {active && <span className={styles.navDot} aria-hidden />}
                {n.label}
              </Link>
            );
          })}
        </nav>
        <span className={styles.navBracket} aria-hidden>]</span>

        <button className={styles.cta} type="button" onClick={() => setIsRegOpen(true)}>
          Register Now
        </button>

        <button
          className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnOpen : ""}`}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className={styles.mobileNav}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          >
            {NAV.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname?.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`${styles.mobileNavLink} ${active ? styles.navLinkActive : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {n.label}
                </Link>
              );
            })}
            <button
              className={styles.mobileRegisterBtn}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setIsRegOpen(true);
              }}
            >
              Register Now
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.glow} aria-hidden />
          <div className={styles.heroRig} aria-hidden>
            <span className={styles.heroRing} />
            <span className={`${styles.heroRing} ${styles.heroRingInner}`} />
          </div>
          <motion.span
            className={styles.kicker}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {kicker}
          </motion.span>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className={styles.intro}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
          >
            {intro}
          </motion.p>
        </section>

        <div className={styles.contentWrap}>
          {children}
        </div>
      </main>

      <SiteFooter />

      <RegistrationModal isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} />
    </div>
  );
}
