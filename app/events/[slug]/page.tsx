"use client";

import { useRouter, useParams } from "next/navigation";
import EventDetailModal from "@/components/overlays/EventDetailModal";
import { findEventBySlug } from "@/lib/eventData";

export default function EventDossierPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "squabble";
  const event = findEventBySlug(slug) || findEventBySlug("squabble");

  if (!event) {
    router.push("/");
    return null;
  }

  return (
    <EventDetailModal
      event={event}
      isOpen={true}
      onClose={() => router.push("/")}
      onRegister={(domainName) => {
        const targetEvent = findEventBySlug(domainName) || event;
        router.push(`/register?event=${encodeURIComponent(targetEvent.slug)}`);
      }}
    />
  );
}
