"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { TransparentLogo } from "@/components/ui/TransparentLogo";
import { NAV_LINKS } from "@/data/navigation";
import { CONTACT_INFO } from "@/data/company";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/cn";

const SECTION_IDS = NAV_LINKS.map((link) => link.href.slice(1));

type UnderlineMetrics = {
  left: number;
  width: number;
  top: number;
};

const HIDDEN_UNDERLINE: UnderlineMetrics = { left: 0, width: 0, top: 0 };

function measureUnderline(
  navEl: HTMLElement | null,
  linkEl: HTMLAnchorElement | null,
): UnderlineMetrics {
  if (!navEl || !linkEl) return HIDDEN_UNDERLINE;

  const navRect = navEl.getBoundingClientRect();
  const linkRect = linkEl.getBoundingClientRect();

  return {
    left: linkRect.left - navRect.left,
    width: linkRect.width,
    top: linkRect.bottom - navRect.top - 2,
  };
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { activeId, navigateToSection } = useActiveSection(SECTION_IDS);

  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const desktopLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const mobileLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [desktopUnderline, setDesktopUnderline] =
    useState<UnderlineMetrics>(HIDDEN_UNDERLINE);
  const [mobileUnderline, setMobileUnderline] =
    useState<UnderlineMetrics>(HIDDEN_UNDERLINE);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const activeIndex = NAV_LINKS.findIndex((link) => link.href === `#${activeId}`);

  useLayoutEffect(() => {
    const update = () => {
      setDesktopUnderline(
        measureUnderline(
          desktopNavRef.current,
          desktopLinkRefs.current[activeIndex] ?? null,
        ),
      );

      if (isMenuOpen) {
        setMobileUnderline(
          measureUnderline(
            mobileNavRef.current,
            mobileLinkRefs.current[activeIndex] ?? null,
          ),
        );
      }
    };

    update();

    // Remeasure after the mobile drawer finishes expanding.
    const timer = isMenuOpen ? window.setTimeout(update, 320) : undefined;

    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [activeIndex, isMenuOpen, isScrolled]);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    const sectionId = href.slice(1);
    const wasMenuOpen = isMenuOpen;
    setIsMenuOpen(false);
    navigateToSection(sectionId, {
      // Wait for the mobile drawer to collapse so section offsets are stable.
      scrollDelayMs: wasMenuOpen ? 320 : 0,
    });
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-ink transition-shadow duration-300 ${
        isScrolled ? "shadow-lg shadow-ink/20" : ""
      }`}
    >
      <Container className="flex h-[78px] items-center justify-between gap-4 lg:max-w-[1520px] lg:px-[72px]">
        <a
          href="#home"
          onClick={(event) => handleNavClick(event, "#home")}
          className="flex shrink-0 items-center"
        >
          <span className="relative block h-[66px] w-[112px]">
            <TransparentLogo alt="Floor Expert" priority sizes="224px" />
          </span>
        </a>

        <nav
          ref={desktopNavRef}
          className="relative hidden flex-1 items-center justify-center gap-7 lg:flex"
        >
          {NAV_LINKS.map((link, index) => {
            const isActive = link.href === `#${activeId}`;
            return (
              <a
                key={link.href}
                ref={(el) => {
                  desktopLinkRefs.current[index] = el;
                }}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
                className={cn(
                  "pb-1 text-sm font-medium transition-colors duration-300",
                  isActive ? "text-cream" : "text-cream/70 hover:text-cream",
                )}
              >
                {link.label}
              </a>
            );
          })}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-0.5 rounded-full bg-bronze transition-[left,width,top] duration-300 ease-out"
            style={{
              left: desktopUnderline.left,
              width: desktopUnderline.width,
              top: desktopUnderline.top,
              opacity: desktopUnderline.width > 0 ? 1 : 0,
            }}
          />
        </nav>

        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          <a
            href={CONTACT_INFO.phoneHref}
            className="flex items-center gap-2 text-sm font-semibold text-cream transition-colors hover:text-bronze-light"
          >
            <Icon name="phone" className="h-4 w-4 text-bronze-light" />
            {CONTACT_INFO.phone}
          </a>
          <a
            href="#contact"
            onClick={(event) => handleNavClick(event, "#contact")}
            className="rounded-md bg-bronze px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-bronze-light"
          >
            Зв&apos;язатися з нами
          </a>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={isMenuOpen}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cream/15 text-cream lg:hidden"
        >
          <Icon name={isMenuOpen ? "close" : "menu"} className="h-5 w-5" />
        </button>
      </Container>

      <div
        className={`grid overflow-hidden bg-ink transition-all duration-300 lg:hidden ${
          isMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <Container className="flex flex-col gap-1 pb-8">
            <nav ref={mobileNavRef} className="relative flex flex-col gap-1">
              {NAV_LINKS.map((link, index) => {
                const isActive = link.href === `#${activeId}`;
                return (
                  <a
                    key={link.href}
                    ref={(el) => {
                      mobileLinkRefs.current[index] = el;
                    }}
                    href={link.href}
                    onClick={(event) => handleNavClick(event, link.href)}
                    className={cn(
                      "rounded-md px-3 py-3 text-base font-medium transition-colors duration-300",
                      isActive
                        ? "text-cream"
                        : "text-cream/85 hover:bg-cream/5 hover:text-bronze-light",
                    )}
                  >
                    {link.label}
                  </a>
                );
              })}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute h-0.5 rounded-full bg-bronze transition-[left,width,top] duration-300 ease-out"
                style={{
                  left: mobileUnderline.left,
                  width: mobileUnderline.width,
                  top: mobileUnderline.top,
                  opacity: isMenuOpen && mobileUnderline.width > 0 ? 1 : 0,
                }}
              />
            </nav>
            <a
              href={CONTACT_INFO.phoneHref}
              className="mt-2 flex items-center gap-2 px-3 text-base font-semibold text-cream"
            >
              <Icon name="phone" className="h-4 w-4 text-bronze-light" />
              {CONTACT_INFO.phone}
            </a>
            <a
              href="#contact"
              onClick={(event) => handleNavClick(event, "#contact")}
              className="mt-4 rounded-md bg-bronze px-5 py-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-bronze-light"
            >
              Зв&apos;язатися з нами
            </a>
          </Container>
        </div>
      </div>
    </header>
  );
}
