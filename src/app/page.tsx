import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { CostCalculator } from "@/components/sections/CostCalculator";
import { Materials } from "@/components/sections/Materials";
import { ProjectsGallery } from "@/components/sections/ProjectsGallery";
import { WorkProcess } from "@/components/sections/WorkProcess";
import { Features } from "@/components/sections/Features";
import { ContactSection } from "@/components/sections/ContactSection";
import { DiscountPopup } from "@/components/discount/DiscountPopup";
import { CalculatorProvider } from "@/context/CalculatorContext";
import { DiscountProvider } from "@/context/DiscountContext";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <CalculatorProvider>
          <DiscountProvider>
            <CostCalculator />
            <Materials />
            <ProjectsGallery />
            <WorkProcess />
            <Features />
            <ContactSection />
            <DiscountPopup />
          </DiscountProvider>
        </CalculatorProvider>
      </main>
      <Footer />
    </>
  );
}
