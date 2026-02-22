import { Plane } from "lucide-react";
import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/config/site";

interface LogoProps {
  variant?: "header" | "footer" | "auth";
}

export default function Logo({ variant = "header" }: LogoProps) {
  const sizes = {
    header: "w-8 h-8",
    footer: "w-10 h-10",
    auth: "w-10 h-10",
  };

  const textSizes = {
    header: "text-2xl",
    footer: "text-2xl",
    auth: "text-3xl",
  };

  const content = (
    <div className="flex items-center gap-3">
      <div
        className={`${sizes[variant]} bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600`}
      >
        <Plane className="w-6 h-6" />
      </div>
      <div>
        <span
          className={`${textSizes[variant]} font-bold ${
            variant === "footer"
              ? "text-white"
              : variant === "auth"
                ? "text-emerald-950"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent"
          }`}
        >
          {SITE_NAME}
        </span>
        {variant === "header" && (
          <div className="text-xs text-white">{SITE_TAGLINE}</div>
        )}
      </div>
    </div>
  );

  if (variant === "auth") {
    return (
      <Link href="/" className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
