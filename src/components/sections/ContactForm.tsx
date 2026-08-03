"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useCalculatorContext } from "@/context/CalculatorContext";
import { useDiscountContext } from "@/context/DiscountContext";
import {
  trackAdsConversion,
  trackContactFormSubmitSuccess,
} from "@/lib/analytics";
import { hasAttachableCalculations } from "@/lib/calculator";
import { GOOGLE_ADS_LEAD_CONVERSION_ID } from "@/lib/site-config";
import { isValidPhone } from "@/lib/validation/lead";
import type { ContactApiResponse, LeadFormPayload } from "@/types/lead";

type FormStatus = "idle" | "submitting" | "success" | "error";

type FieldErrors = Partial<Record<"name" | "phone", string>>;

const inputClassName =
  "w-full rounded-xl border bg-cream px-4 py-3.5 text-sm text-ink placeholder:text-ink/40 focus:border-bronze focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze/40";

export function ContactForm() {
  const {
    calculations: liveCalculations,
    attachCalculationsToken,
  } = useCalculatorContext();
  const { discountActivated, markLeadSubmitted } = useDiscountContext();
  const nameId = useId();
  const phoneId = useId();
  const includeId = useId();
  const nameErrorId = useId();
  const phoneErrorId = useId();
  const formMessageId = useId();
  const calcErrorId = useId();

  const [status, setStatus] = useState<FormStatus>("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [includeCalculations, setIncludeCalculations] = useState(false);
  const [handledAttachToken, setHandledAttachToken] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  /** Guards against Strict Mode / re-render double-firing analytics. */
  const successAnalyticsFiredRef = useRef(false);

  // Adjust state during render when the calculator CTA asks to attach (React-recommended pattern).
  if (attachCalculationsToken > handledAttachToken) {
    setHandledAttachToken(attachCalculationsToken);
    if (hasAttachableCalculations(liveCalculations)) {
      setIncludeCalculations(true);
      setCalcError(null);
    }
  }

  function validateFields(): FieldErrors {
    const errors: FieldErrors = {};
    if (!name.trim()) {
      errors.name = "Вкажіть ваше ім'я.";
    }
    if (!phone.trim()) {
      errors.phone = "Вкажіть ваш телефон.";
    } else if (!isValidPhone(phone)) {
      errors.phone = "Вкажіть коректний номер телефону.";
    }
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current || status === "submitting") return;

    setFormError(null);
    setCalcError(null);

    const errors = validateFields();
    setFieldErrors(errors);

    if (includeCalculations && !hasAttachableCalculations(liveCalculations)) {
      setCalcError("Спочатку додайте послуги в калькуляторі.");
      setStatus("idle");
      return;
    }

    if (Object.keys(errors).length > 0) {
      setStatus("idle");
      return;
    }

    submittingRef.current = true;
    setStatus("submitting");

    const payload: LeadFormPayload = {
      name: name.trim(),
      phone: phone.trim(),
      ...(includeCalculations ? { calculations: liveCalculations } : {}),
      ...(discountActivated ? { discountActivated: true } : {}),
      source: "website",
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: ContactApiResponse | null = null;
      try {
        data = (await response.json()) as ContactApiResponse;
      } catch {
        data = null;
      }

      if (!response.ok || !data || !data.ok) {
        const apiError = data && !data.ok ? data : null;
        setFieldErrors({
          name: apiError?.fieldErrors?.name,
          phone: apiError?.fieldErrors?.phone,
        });
        setFormError(apiError?.error ?? "Не вдалося надіслати заявку. Спробуйте пізніше.");
        setStatus("error");
        return;
      }

      setName("");
      setPhone("");
      setIncludeCalculations(false);
      setFieldErrors({});
      setFormError(null);
      setCalcError(null);
      setStatus("success");
      markLeadSubmitted();

      if (!successAnalyticsFiredRef.current) {
        successAnalyticsFiredRef.current = true;
        trackContactFormSubmitSuccess();
        trackAdsConversion(GOOGLE_ADS_LEAD_CONVERSION_ID, {
          value: 1.0,
          currency: "UAH",
        });
      }
    } catch {
      setFormError("Немає з'єднання з сервером. Спробуйте ще раз.");
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  }

  const isSuccess = status === "success";
  const isSubmitting = status === "submitting";

  return (
    <div className="relative w-full overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className={`flex w-full flex-col gap-3${isSuccess ? " invisible" : ""}`}
        noValidate
        aria-hidden={isSuccess}
        inert={isSuccess ? true : undefined}
        aria-describedby={!isSuccess && formError ? formMessageId : undefined}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={nameId} className="sr-only">
            Ваше ім&apos;я
          </label>
          <input
            id={nameId}
            type="text"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (fieldErrors.name) {
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }
            }}
            placeholder="Ваше ім'я"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? nameErrorId : undefined}
            className={`${inputClassName} ${fieldErrors.name ? "border-red-400" : "border-ink/8"}`}
            disabled={isSubmitting}
          />
          {fieldErrors.name ? (
            <p id={nameErrorId} className="text-xs text-red-600" role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={phoneId} className="sr-only">
            Ваш телефон
          </label>
          <input
            id={phoneId}
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              if (fieldErrors.phone) {
                setFieldErrors((current) => ({ ...current, phone: undefined }));
              }
            }}
            placeholder="Ваш телефон"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? phoneErrorId : undefined}
            className={`${inputClassName} ${fieldErrors.phone ? "border-red-400" : "border-ink/8"}`}
            disabled={isSubmitting}
          />
          {fieldErrors.phone ? (
            <p id={phoneErrorId} className="text-xs text-red-600" role="alert">
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={includeId}
            className="flex cursor-pointer items-start gap-2.5 pl-1 text-sm text-ink/80"
          >
            <input
              id={includeId}
              type="checkbox"
              checked={includeCalculations}
              onChange={(event) => {
                setIncludeCalculations(event.target.checked);
                setCalcError(null);
              }}
              disabled={isSubmitting}
              aria-invalid={Boolean(calcError)}
              aria-describedby={calcError ? calcErrorId : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-ink/25 accent-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span>Додати розрахунок із калькулятора</span>
          </label>
          {calcError ? (
            <p id={calcErrorId} className="pl-7 text-xs text-red-600" role="alert">
              {calcError}
            </p>
          ) : null}
        </div>

        {formError ? (
          <p id={formMessageId} className="text-xs text-red-600" role="alert">
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          className="mt-1 w-full rounded-xl"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Надсилаємо…" : "Відправити заявку"}
        </Button>
      </form>

      {isSuccess ? (
        <div
          className="absolute inset-0 flex w-full flex-col items-center justify-center gap-2 text-center"
          role="status"
          aria-live="polite"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-cream">
            <Icon name="check" className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold text-ink">Дякуємо!</h3>
          <p className="text-sm leading-relaxed text-ink-soft/65">
            Ваша заявка прийнята. Ми передзвонимо вам найближчим часом.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-1 rounded-xl"
            onClick={() => {
              successAnalyticsFiredRef.current = false;
              setStatus("idle");
            }}
          >
            Надіслати ще одну заявку
          </Button>
        </div>
      ) : null}
    </div>
  );
}
