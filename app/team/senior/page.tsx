import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import { EVENT_INFO } from "@/lib/eventData";
import TeamPageClient from "../TeamPageClient";

export const metadata: Metadata = {
  title: "Senior Council — Techopedia Level 15",
  description:
    "Senior council members behind Techopedia Level 15 — mentors, leadership, and technical stewards.",
};

export default function SeniorCouncilPage() {
  return (
    <PageShell
      kicker={`Senior Council · ${EVENT_INFO.dates}`}
      title="Senior Council"
      intro="The senior council brings experience, strategic guidance, and steady leadership to every moving part of the event."
    >
      <TeamPageClient initialActive="Senior" />
    </PageShell>
  );
}
