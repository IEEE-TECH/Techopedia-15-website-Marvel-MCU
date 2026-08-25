import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import TeamPageClient from "./TeamPageClient";

export const metadata: Metadata = {
  title: "The Team — Techopedia Level 15",
  description:
    "The organizing committee behind Techopedia Level 15 — leadership, technical, design, operations and outreach.",
};

export default function TeamPage() {
  return (
    <PageShell
      kicker="The People Behind Level 15"
      title="Core Team"
      intro="Techopedia is run entirely by students. These are the people who spent months turning an idea into two days of competition."
    >
      <TeamPageClient />
    </PageShell>
  );
}
