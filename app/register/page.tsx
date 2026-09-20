"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RegistrationModal from "@/components/ui/RegistrationModal";
import { findEventBySlug } from "@/lib/eventData";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventParam = searchParams.get("event");
  const event = eventParam ? findEventBySlug(eventParam) : undefined;

  return (
    <RegistrationModal
      isOpen={true}
      initialDomain={event?.name || "Squabble"}
      lockDomain={Boolean(event)}
      onClose={() => router.push("/")}
    />
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
