"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SupabaseVerify() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("type") === "recovery") {
      router.replace("/reset-password" + window.location.search);
    } else {
      router.replace("/");
    }
  }, [params, router]);

  return null;
}
