import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SERVICE_CARDS } from "@/data/services";

export function Services() {
  return (
    <section id="services" className="border-t border-ink/[0.06] bg-white">
      <Container className="pt-16 pb-12 sm:pt-20 sm:pb-14 lg:max-w-[1520px] lg:px-[72px] lg:pt-[72px] lg:pb-14">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-ink-soft/70">
          Наші послуги
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-9 lg:grid-cols-5 lg:gap-6">
          {SERVICE_CARDS.map((service) => (
            <div
              key={service.title}
              className="flex h-full items-center gap-4 rounded-xl border border-ink/10 bg-white px-5 py-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cream text-bronze-dark">
                <Icon name={service.icon} className="h-6 w-6" />
              </span>
              <div className="flex flex-col">
                <h3 className="text-[15px] font-semibold leading-snug text-ink">
                  {service.title}
                </h3>
                <span className="mt-1 text-[13px] leading-tight text-ink-soft/60">
                  {service.priceLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
