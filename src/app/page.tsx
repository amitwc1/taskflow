"use client";

import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ProductPreview from "@/components/landing/ProductPreview";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import { CTASection, Footer } from "@/components/landing/CTAFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1120] text-gray-900 dark:text-gray-100">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <ProductPreview />
      <Testimonials />
      <Pricing />
      <CTASection />
      <Footer />
    </div>
  );
}
