"use client";

import { LandingNav } from "./landing-nav";
import { LandingFooter } from "./landing-footer";
import { IconMail, IconClock, IconSend } from "@tabler/icons-react";
import { useState } from "react";

const topics = [
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "sales", label: "Sales & Pricing" },
  { value: "partnership", label: "Partnership" },
];

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--landing-bg)" }}
    >
      <LandingNav />

      <main>
        {/* Hero Section */}
        <section className="px-6 pb-12 pt-20 text-center md:pb-16 md:pt-28">
          <div className="mx-auto max-w-3xl">
            <p
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--landing-accent)" }}
            >
              Contact
            </p>
            <h1
              className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: "var(--landing-text)" }}
            >
              Get in touch
            </h1>
            <p
              className="mt-4 text-lg leading-relaxed"
              style={{ color: "var(--landing-text-muted)" }}
            >
              Have questions? We&apos;d love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="px-6 pb-24">
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-3">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl p-8"
                style={{
                  backgroundColor: "var(--landing-card)",
                  boxShadow: "0 20px 40px -12px var(--landing-shadow)",
                  border: "1px solid var(--landing-border)",
                }}
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium"
                      style={{ color: "var(--landing-text)" }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="h-12 w-full rounded-xl px-4 text-sm outline-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: "var(--landing-bg)",
                        color: "var(--landing-text)",
                        border: "1px solid var(--landing-border)",
                      }}
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium"
                      style={{ color: "var(--landing-text)" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="h-12 w-full rounded-xl px-4 text-sm outline-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: "var(--landing-bg)",
                        color: "var(--landing-text)",
                        border: "1px solid var(--landing-border)",
                      }}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Topic */}
                <div className="mt-6">
                  <label
                    htmlFor="topic"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--landing-text)" }}
                  >
                    Topic
                  </label>
                  <select
                    id="topic"
                    required
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="h-12 w-full rounded-xl px-4 text-sm outline-none transition-all focus:ring-2"
                    style={{
                      backgroundColor: "var(--landing-bg)",
                      color: formData.topic
                        ? "var(--landing-text)"
                        : "var(--landing-text-muted)",
                      border: "1px solid var(--landing-border)",
                    }}
                  >
                    <option value="" disabled>
                      Select a topic
                    </option>
                    {topics.map((topic) => (
                      <option key={topic.value} value={topic.value}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="mt-6">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--landing-text)" }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    style={{
                      backgroundColor: "var(--landing-bg)",
                      color: "var(--landing-text)",
                      border: "1px solid var(--landing-border)",
                      resize: "none",
                    }}
                    placeholder="How can we help you?"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-base font-medium transition-all duration-200 hover:scale-[1.02] sm:w-auto sm:px-8"
                  style={{
                    backgroundColor: "var(--landing-accent)",
                    color: "var(--landing-accent-foreground)",
                  }}
                >
                  Send Message
                  <IconSend className="size-5" />
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: "var(--landing-card)",
                  border: "1px solid var(--landing-border)",
                }}
              >
                <div
                  className="mb-4 inline-flex size-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: "var(--landing-bg-alt)",
                    border: "1px solid var(--landing-border)",
                  }}
                >
                  <IconMail
                    className="size-6"
                    style={{ color: "var(--landing-accent)" }}
                  />
                </div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--landing-text)" }}
                >
                  Email us
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--landing-text-muted)" }}
                >
                  hello@aistudio.no
                </p>
              </div>

              <div
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: "var(--landing-card)",
                  border: "1px solid var(--landing-border)",
                }}
              >
                <div
                  className="mb-4 inline-flex size-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: "var(--landing-bg-alt)",
                    border: "1px solid var(--landing-border)",
                  }}
                >
                  <IconClock
                    className="size-6"
                    style={{ color: "var(--landing-accent)" }}
                  />
                </div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--landing-text)" }}
                >
                  Response time
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--landing-text-muted)" }}
                >
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
