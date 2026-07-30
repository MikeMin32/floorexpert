import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { ContactForm } from "@/components/sections/ContactForm";
import { ContactIntroCopy } from "@/components/sections/ContactIntroCopy";
import { CONTACT_INFO } from "@/data/company";

export function ContactSection() {
  return (
    <section id="contact" className="bg-cream pb-16 sm:pb-20">
      <Container>
        <div className="overflow-hidden rounded-[1.75rem] border border-ink/6 bg-cream-dark/60 shadow-[0_20px_60px_-40px_rgba(20,16,13,0.35)]">
          <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.95fr)_auto] lg:gap-10">
            <div className="relative min-h-[240px] sm:min-h-[300px] lg:min-h-[360px]">
              <Image
                src="/images/contact/contact.png"
                alt="Інтер'єр з якісною підлогою"
                fill
                quality={95}
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-2/5 bg-gradient-to-r from-transparent to-cream-dark/60"
                aria-hidden="true"
              />
            </div>

            <div className="flex flex-col justify-center gap-3 px-6 sm:px-8 lg:px-0 lg:py-10">
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Зв&apos;яжіться з нами
              </h2>
              <ContactIntroCopy />
            </div>

            <div className="flex items-center px-6 sm:px-8 lg:px-0 lg:py-10">
              <ContactForm />
            </div>

            <div className="flex flex-col justify-center gap-4 border-t border-ink/8 px-6 pt-6 pb-8 sm:px-8 lg:border-t-0 lg:border-l lg:px-8 lg:py-10 lg:pr-10">
              <a
                href={CONTACT_INFO.phoneHref}
                className="flex items-center gap-3 text-sm font-semibold text-ink transition-colors hover:text-bronze-dark"
              >
                <Icon name="phone" className="h-5 w-5 shrink-0 text-bronze-dark" />
                {CONTACT_INFO.phone}
              </a>
              <div className="flex items-center gap-3 text-sm font-medium text-ink">
                <Icon name="pin" className="h-5 w-5 shrink-0 text-bronze-dark" />
                {CONTACT_INFO.address}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
