import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import SponsorsPageClient from "./SponsorsPageClient";

export const metadata: Metadata = {
  title: "Sponsors & Partners — Techopedia Level 15",
  description:
    "Partner with Techopedia Level 15 — reach 1500+ engineering students across two days of hackathons, CTF, robotics and more.",
};

export default function SponsorsPage() {
  return (
    <PageShell
      kicker="Partner With Level 15"
      title="Sponsors"
      intro="Techopedia runs on the backing of companies who want to meet engineers before anyone else does. Here is who makes Level 15 possible."
    >
      <SponsorsPageClient />
    </PageShell>
  );
}
