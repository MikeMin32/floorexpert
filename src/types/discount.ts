export type DiscountEligibility = {
  eligible: boolean;
  dismissCount: number;
  maxDismisses: number;
  /** IP already sent a lead with the discount claimed. */
  discountLeadSubmitted: boolean;
};
