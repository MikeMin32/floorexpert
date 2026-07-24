export type LeadCalculationItem = {
  serviceId: string;
  serviceName: string;
  unit: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type LeadCalculations = {
  items: LeadCalculationItem[];
  totalCost: number;
  totalArea: number;
  totalLinearLength: number;
};

export type LeadFormPayload = {
  name: string;
  phone: string;
  calculations?: LeadCalculations;
  source: "website";
  createdAt: string;
};

export type ContactApiSuccess = {
  ok: true;
  message: string;
};

export type ContactApiError = {
  ok: false;
  error: string;
  fieldErrors?: Partial<Record<"name" | "phone" | "calculations", string>>;
};

export type ContactApiResponse = ContactApiSuccess | ContactApiError;
