import dayjs from "dayjs";

/**
 * Formats a number or numeric string as USD currency with two decimal places.
 * Example: 1250.5 -> "$1,250.50"
 *
 * @param amount - Number or string representing the amount
 * @returns Formatted USD currency string
 */
export function formatCurrency(amount: number | string, currency: string = "USD"): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

export const formatUSD = formatCurrency;


export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("MM/DD/YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
