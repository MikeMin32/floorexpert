import { Container } from "@/components/ui/Container";
import { Gallery } from "@/components/gallery/Gallery";
import { WORK_IMAGES } from "@/data/works";

export function ProjectsGallery() {
  return (
    <section id="works" className="bg-white py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-12 sm:gap-14">
        <div className="flex max-w-2xl flex-col items-center text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-bronze sm:text-[13px]">
            Наші роботи
          </span>
          <h2 className="mt-3 font-sans text-[32px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[36px] lg:text-[40px]">
            Галерея робіт
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft/70 sm:text-base">
            Реалізовані проєкти з укладання підлоги — чистий результат у реальних інтер&apos;єрах.
          </p>
        </div>

        <Gallery images={WORK_IMAGES} className="w-full max-w-5xl" />
      </Container>
    </section>
  );
}
