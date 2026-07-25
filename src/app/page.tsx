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
import { CalculatorProvider } from "@/context/CalculatorContext";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <CalculatorProvider>
          <CostCalculator />
          <Materials />
          <ProjectsGallery />
          <WorkProcess />
          <Features />
          <ContactSection />
        </CalculatorProvider>
      </main>
      <Footer />
    </>
  );
}
