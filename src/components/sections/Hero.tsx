import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { FEATURES } from "@/data/features";
import { COMPANY_TAGLINE } from "@/data/company";
export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-cream lg:flex lg:min-h-[max(640px,calc(100vh-var(--header-height)))] lg:items-center"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block">
        <div className="relative h-full w-full">
          <Image
            src="/images/hero/hero.png"
            alt="Інтер'єр з укладеним ламінатом та плінтусом"
            fill
            priority
            quality={95}
            sizes="58vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #f8f5ef 0%, rgba(248, 245, 239, 0.94) 10%, rgba(248, 245, 239, 0.72) 22%, rgba(248, 245, 239, 0.42) 38%, rgba(248, 245, 239, 0.16) 55%, rgba(248, 245, 239, 0.04) 70%, rgba(248, 245, 239, 0) 82%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 65% 70% at 6% 80%, rgba(248, 245, 239, 0.4) 0%, rgba(248, 245, 239, 0.14) 45%, rgba(248, 245, 239, 0) 72%)",
            }}
          />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[52%] lg:block"
        style={{
          background:
            "linear-gradient(90deg, #f8f5ef 0%, #f8f5ef 58%, rgba(248, 245, 239, 0.7) 78%, rgba(248, 245, 239, 0.2) 92%, rgba(248, 245, 239, 0) 100%)",
        }}
      />

      <Container className="relative z-10 flex w-full flex-col gap-10 py-14 sm:py-16 lg:max-w-[1520px] lg:px-[72px] lg:py-16">
        <div className="flex max-w-xl flex-col items-start lg:max-w-[520px]">
          <span className="mb-4 text-[13px] font-semibold tracking-[0.18em] text-bronze-dark uppercase lg:mb-[26px]">
            {COMPANY_TAGLINE}
          </span>
          <h1 className="text-4xl leading-[1.12] font-bold tracking-[-0.02em] text-ink sm:text-5xl lg:text-[49px]">
            Професійне встановлення
            <br />
            ламінату, кварцвінілу
            <br />
            та плінтуса
          </h1>
          <p className="mt-[22px] max-w-md text-[16px] leading-[1.5] text-ink-soft/70 lg:mt-[28px]">
            Якісно. Надійно. Вчасно.
            <br />
            Працюємо по Києву та області.
          </p>
          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:mt-[28px]">
            <a
              href="#calculator"
              className="flex h-12 w-full items-center justify-center rounded-md bg-ink text-sm font-semibold text-cream transition-colors hover:bg-ink-soft sm:w-[190px]"
            >
              Розрахувати вартість
            </a>
            <a
              href="#works"
              className="flex h-12 w-full items-center justify-center rounded-md border border-ink/15 bg-white/60 text-sm font-semibold text-ink transition-colors hover:bg-white sm:w-[150px]"
            >
              Наші роботи
            </a>
          </div>

          <dl className="mt-14 grid w-full grid-cols-2 gap-x-4 gap-y-6 border-t border-ink/10 pt-6 sm:grid-cols-4 lg:mt-12 lg:pt-5">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex min-w-0 items-center gap-2">
                <Icon
                  name={feature.icon}
                  className="h-5 w-5 shrink-0 text-bronze-dark"
                />
                <dt className="min-w-0 text-[13px] font-semibold text-ink">
                  {feature.title}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      <div className="relative aspect-[4/3] w-full lg:hidden">
        <Image
          src="/images/hero/hero.png"
          alt="Інтер'єр з укладеним ламінатом та плінтусом"
          fill
          priority
          quality={95}
          sizes="(max-width: 1023px) 100vw, 58vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
}
