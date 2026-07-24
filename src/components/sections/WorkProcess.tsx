import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { PROCESS_STEPS } from "@/data/process";

export function WorkProcess() {
  return (
    <section id="process" className="bg-cream py-20 sm:py-24">
      <Container className="flex flex-col gap-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/70">
          Як ми працюємо
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
          {PROCESS_STEPS.map((step, index) => (
            <div key={step.index} className="contents">
              <article className="flex flex-col gap-4 rounded-2xl border border-ink/8 bg-cream-dark/50 p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-bronze/25 bg-cream text-bronze-dark">
                  <Icon name={step.icon} className="h-6 w-6" />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-ink">
                    <span className="text-bronze-dark">{step.index}</span> {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-soft/65">{step.description}</p>
                </div>
              </article>

              {index < PROCESS_STEPS.length - 1 ? (
                <div
                  className="hidden items-center justify-center lg:flex"
                  aria-hidden="true"
                >
                  <Icon name="arrowRight" className="h-5 w-5 text-ink/35" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
