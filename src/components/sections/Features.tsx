import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { FEATURES } from "@/data/features";

export function Features() {
  return (
    <section id="features" className="bg-cream pt-20 pb-20 sm:pt-24 sm:pb-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Чому обирають нас"
          title="Переваги співпраці з Floor Expert"
          description="Понад п'ять років ми допомагаємо перетворювати підлогу на завершений елемент інтер'єру."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col gap-4 rounded-2xl border border-ink/8 bg-white p-7 shadow-sm shadow-ink/5 transition-all duration-300 hover:-translate-y-1 hover:border-bronze/30 hover:shadow-lg hover:shadow-bronze/10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-bronze-light transition-colors duration-300 group-hover:bg-bronze group-hover:text-ink">
                <Icon name={feature.icon} className="h-6 w-6" />
              </span>
              <h3 className="font-display text-lg text-ink">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
