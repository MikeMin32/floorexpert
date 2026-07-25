import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MATERIAL_ADVANTAGES, MATERIAL_CARDS } from "@/data/materials";

export function Materials() {
  return (
    <section id="materials" className="bg-cream py-20 sm:py-28">
      <Container className="lg:max-w-[1520px] lg:px-[72px]">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)] lg:items-stretch lg:gap-10 xl:gap-12">
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-bronze sm:text-[13px]">
              Про ламінат та кварцвініл
            </span>

            <h2 className="mt-3 font-sans text-[32px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[36px] lg:text-[40px]">
              Що таке ламінат та кварцвініл?
            </h2>

            <div className="mt-5 space-y-3.5 text-[15px] leading-relaxed text-ink-soft/80 sm:mt-6 sm:text-base">
              <p>
                <span className="font-semibold text-ink">Ламінат</span> — це
                багатошарове покриття, яке поєднує в собі естетику натурального дерева
                та високу зносостійкість.
              </p>
              <p>
                <span className="font-semibold text-ink">Кварцвініл</span> —
                сучасне покриття на основі ПВХ та кварцового піску, 100% вологостійке,
                міцне та довговічне.
              </p>
            </div>

            <ul className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 sm:mt-8">
              {MATERIAL_ADVANTAGES.map((advantage) => (
                <li key={advantage.label} className="flex items-center gap-3">
                  <Icon
                    name={advantage.icon}
                    className="h-5 w-5 flex-shrink-0 text-bronze"
                  />
                  <span className="text-sm leading-snug text-ink-soft/80">
                    {advantage.label}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              href="#contact"
              variant="outline"
              className="mt-8 w-fit rounded-md bg-transparent px-5 py-2.5 text-sm font-medium shadow-none sm:mt-9"
            >
              Дізнатися більше
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:h-full lg:min-h-0 lg:gap-[1.1rem]">
            {MATERIAL_CARDS.map((card) => (
              <article
                key={card.label}
                className="relative aspect-[16/10] overflow-hidden rounded-[18px] sm:aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-0"
              >
                <Image
                  src={card.imageSrc}
                  alt={card.alt}
                  fill
                  quality={95}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 720px"
                  className="object-cover"
                  style={{ objectPosition: card.objectPosition }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/50 via-black/18 to-transparent"
                />
                <span className="absolute bottom-3.5 left-3.5 text-[15px] font-medium text-white">
                  {card.label}
                </span>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
