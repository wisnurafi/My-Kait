import { setRequestLocale } from "next-intl/server";
import { LandingHero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FreeBanner } from "@/components/landing/free-banner";
import { Footer } from "@/components/landing/footer";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative">
      <LandingHero />
      <Marquee />
      <Features />
      <HowItWorks />
      <FreeBanner />
      <Footer />
    </main>
  );
}
