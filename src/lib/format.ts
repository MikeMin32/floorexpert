const currencyFormatter = new Intl.NumberFormat("uk-UA", {
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("uk-UA", {
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return `${currencyFormatter.format(Math.round(value))} грн`;
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}
