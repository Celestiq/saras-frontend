// app/page.tsx
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <Pricing />
    </main>
  );
}