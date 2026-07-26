import Link from "next/link";
import { FaEnvelope, FaPhone, FaMarker } from "react-icons/fa6";
import { HiArrowRight } from "react-icons/hi2";

const contactMethods = [
  {
    title: "Email",
    value: "hello@communityspark.org",
    detail: "Send us a message anytime and our team will get back to you within 24 hours.",
    href: "mailto:hello@communityspark.org",
    icon: FaEnvelope,
  },
  {
    title: "Phone",
    value: "+880 1234-567890",
    detail: "Call our support line for live assistance during business hours.",
    href: "tel:+8801234567890",
    icon: FaPhone,
  },
  {
    title: "Location",
    value: "Dhaka, Bangladesh",
    detail: "Our team is based locally and builds AI tools for creators everywhere.",
    href: "https://www.google.com/maps?q=Dhaka+Bangladesh",
    icon: FaMarker,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#08111c] px-5 py-16 text-white sm:px-8 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <section className="rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7184ff]">Contact</p>
              <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                Need help with your AI content workflow?
              </h1>
              <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-slate-400">
                Reach out for product support, partnership inquiries, or a walkthrough of how PostPilot AI can streamline your content process.
              </p>
            </div>
            <div className="space-y-4 rounded-[1.75rem] border border-white/[0.08] bg-[#0f172a]/80 p-6 sm:p-8">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Office hours</p>
              <div className="grid gap-4 text-slate-200">
                <div className="rounded-3xl bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Monday – Friday</p>
                  <p className="mt-2 text-xl font-semibold text-white">10:00 AM – 7:00 PM</p>
                </div>
                <div className="rounded-3xl bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Response time</p>
                  <p className="mt-2 text-xl font-semibold text-white">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {contactMethods.map(({ title, value, detail, href, icon: Icon }) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-[#7184ff]/40 hover:bg-[#0f172a]/90"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#0f172a] text-2xl text-[#7c94ff] shadow-[0_15px_40px_rgba(53,75,194,0.1)]">
                <Icon />
              </div>
              <p className="mt-6 text-sm uppercase tracking-[0.22em] text-slate-400">{title}</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">{value}</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">{detail}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9ba8ff] transition group-hover:text-white">
                Contact {title === "Location" ? "us" : "via"} <HiArrowRight className="text-base" />
              </span>
            </a>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7184ff]">Need a quick answer?</p>
            <h2 className="mt-5 text-3xl font-black text-white">Explore our help resources</h2>
            <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-slate-400">
              If you need help with generating posts, saving drafts, or building your brand voice, our support team is here to guide you.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/features" className="inline-flex items-center gap-2 rounded-2xl bg-[#5067f5] px-6 py-3 font-semibold text-white transition hover:bg-[#6278ff]">
                View features <HiArrowRight />
              </Link>
              <Link href="/generate" className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.05] px-6 py-3 font-semibold text-white transition hover:border-[#7184ff]/40 hover:bg-white/[0.08]">
                Try AI generate
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7184ff]">Contact guidance</p>
            <h2 className="mt-5 text-3xl font-black text-white">How to get the best support</h2>
            <ul className="mt-6 space-y-4 text-slate-300">
              <li className="rounded-3xl border border-white/[0.08] bg-[#0f172a]/80 p-5">
                <p className="font-semibold text-white">Share your use case</p>
                <p className="mt-2 text-slate-400">Tell us which audience or channel you are targeting so we can tailor AI guidance.</p>
              </li>
              <li className="rounded-3xl border border-white/[0.08] bg-[#0f172a]/80 p-5">
                <p className="font-semibold text-white">Include full context</p>
                <p className="mt-2 text-slate-400">If you have brand tone preferences or existing campaigns, mention them for faster help.</p>
              </li>
              <li className="rounded-3xl border border-white/[0.08] bg-[#0f172a]/80 p-5">
                <p className="font-semibold text-white">Use the right link</p>
                <p className="mt-2 text-slate-400">If you are asking about saved posts, include the post title or ID so our team can find it quickly.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
