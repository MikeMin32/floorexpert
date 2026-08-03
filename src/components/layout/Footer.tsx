import { PhoneLink } from "@/components/analytics/PhoneLink";
import { TelegramLink } from "@/components/analytics/TelegramLink";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { TransparentLogo } from "@/components/ui/TransparentLogo";
import {
  CONTACT_INFO,
  COMPANY_NAME,
  COMPANY_TAGLINE,
  SOCIAL_LINKS,
} from "@/data/company";
import { FOOTER_COMPANY_LINKS, FOOTER_SERVICE_LINKS } from "@/data/footer";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink pt-16 pb-8">
      <Container className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
          <a href="#home" className="flex items-center">
            <span className="relative block h-[54px] w-[104px]">
              <TransparentLogo alt={COMPANY_NAME} sizes="208px" />
            </span>
          </a>
          <p className="max-w-xs text-sm leading-relaxed text-cream-dark/60">
            {COMPANY_TAGLINE}. Якісна укладка ламінату, кварцвінілу та плінтуса в Києві та
            області.
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((link) =>
              link.icon === "telegram" ? (
                <TelegramLink
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-bronze text-ink transition-colors hover:bg-bronze-light"
                >
                  <Icon name={link.icon} className="h-4 w-4" />
                </TelegramLink>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-bronze text-ink transition-colors hover:bg-bronze-light"
                >
                  <Icon name={link.icon} className="h-4 w-4" />
                </a>
              ),
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream">Послуги</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {FOOTER_SERVICE_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-cream-dark/70 transition-colors hover:text-cream"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream">Компанія</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {FOOTER_COMPANY_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-cream-dark/70 transition-colors hover:text-cream"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream">Контакти</h3>
          <ul className="mt-4 flex flex-col gap-4 text-sm text-cream-dark/70">
            <li>
              <PhoneLink className="flex items-center gap-3 transition-colors hover:text-cream">
                <Icon name="phone" className="h-4 w-4 shrink-0 text-bronze-light" />
                {CONTACT_INFO.phone}
              </PhoneLink>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="pin" className="h-4 w-4 shrink-0 text-bronze-light" />
              {CONTACT_INFO.address}
            </li>
          </ul>
        </div>
      </Container>

      <Container className="mt-12 flex flex-col gap-4 border-t border-cream/10 pt-6 text-xs text-cream-dark/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {COMPANY_NAME}. Усі права захищені.
        </p>
      </Container>
    </footer>
  );
}
