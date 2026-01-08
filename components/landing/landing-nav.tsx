"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { IconArrowRight } from "@tabler/icons-react";

function AuthButton() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div
        className="h-10 w-28 rounded-full animate-pulse"
        style={{ backgroundColor: "var(--landing-border)" }}
      />
    );
  }

  if (session) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
        style={{
          backgroundColor: "var(--landing-accent)",
          color: "var(--landing-accent-foreground)",
        }}
      >
        Dashboard
        <IconArrowRight className="size-4" />
      </Link>
    );
  }

  return (
    <Link
      href="/sign-in"
      className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
      style={{
        backgroundColor: "var(--landing-accent)",
        color: "var(--landing-accent-foreground)",
      }}
    >
      Get Started
      <IconArrowRight className="size-4" />
    </Link>
  );
}

export function LandingNav() {
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: "var(--landing-bg)",
        borderBottom: "1px solid var(--landing-border)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="font-semibold tracking-tight transition-opacity hover:opacity-80"
          style={{ color: "var(--landing-text)" }}
        >
          AI Studio
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "var(--landing-text-muted)" }}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "var(--landing-text-muted)" }}
          >
            How It Works
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "var(--landing-text-muted)" }}
          >
            Pricing
          </Link>
        </div>

        {/* CTA Button */}
        <Suspense
          fallback={
            <div
              className="h-10 w-28 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--landing-border)" }}
            />
          }
        >
          <AuthButton />
        </Suspense>
      </nav>
    </header>
  );
}
