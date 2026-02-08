import { Navbar } from "@/components/navbar/navbar"
import { HeroSection } from "@/components/hero/hero-section"
import { StatsSection } from "@/components/stats/stats-section"
import { HowItWorksSection } from "@/components/how-it-works/how-it-works-section"
import { FeaturesGridSection } from "@/components/features-grid/features-grid-section"
import { UseCasesSection } from "@/components/use-cases/use-cases-section"
import { PricingSection } from "@/components/pricing/pricing-section"
import { CTASection } from "@/components/cta/cta-section"
import { Footer } from "@/components/footer/footer"

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesGridSection />
      <UseCasesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
