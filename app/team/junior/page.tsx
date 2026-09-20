import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import { EVENT_INFO } from "@/lib/eventData";
import TeamPageClient from "../TeamPageClient";

export const metadata: Metadata = {
  title: "Junior Council — Techopedia Level 15",
  description:
    "Junior council members behind Techopedia Level 15 — operations, technical execution, design, and outreach.",
};

export default function JuniorCouncilPage() {
  return (
    <PageShell
      kicker={`Junior Council · ${EVENT_INFO.dates}`}
      title="Junior Council"
      intro="The junior council powers the event’s execution across development, design, media, and operations with energy and ownership."
    >
      <TeamPageClient initialActive="Junior" />
    </PageShell>
  );
}
