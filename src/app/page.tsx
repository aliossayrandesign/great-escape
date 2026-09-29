import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { TrustedBySection } from "@/components/TrustedBySection";
import { ProcessSection } from "@/components/ProcessSection";
import { WorkSection } from "@/components/WorkSection";
import { CaseStudyTeaser } from "@/components/CaseStudyTeaser";
import { PricingSection } from "@/components/PricingSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { LogoShutterIntro } from "@/components/ui/LogoShutterIntro";

export default function Home() {
  return (
    <main className="pt-28 sm:pt-36">
      <LogoShutterIntro />
      <Nav />
      <Hero />
      <TrustedBySection />
      <ProcessSection />
      <WorkSection />
      <CaseStudyTeaser />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
