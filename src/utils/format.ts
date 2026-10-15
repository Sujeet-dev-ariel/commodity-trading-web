/** INR / lakh formatting helpers (ported from the standalone panel). */

export function inr(n: number): string {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function lakhs(n: number): string {
  return '₹' + (n / 100000).toFixed(1) + 'L';
}

export function freightPrice(low: number, high: number): string {
  return low === high ? inr(low) : `${inr(low)}–${high}`;
}
