import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import { EVENT_INFO } from "@/lib/eventData";
import TeamPageClient from "./TeamPageClient";

export const metadata: Metadata = {
  title: "The Team — Techopedia Level 15",
  description:
    "The organizing committee behind Techopedia Level 15 — leadership, technical, design, operations and outreach.",
};

export default function TeamPage() {
  return (
    <PageShell
      kicker={`The People Behind Level 15 · ${EVENT_INFO.dates}`}
      title="Core Team"
      intro={`Techopedia is run entirely by ${EVENT_INFO.org} volunteers. These are the people who spent months turning an idea into ${EVENT_INFO.duration.toLowerCase()} of competition.`}
    >
      <TeamPageClient />
    </PageShell>
  );
}
