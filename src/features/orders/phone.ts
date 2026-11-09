/** Arabic-Indic and Persian digits to ASCII. */
function toAscii(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Egyptian mobile number to the local 11-digit form (01XXXXXXXXX), or null when it is not valid.
 * Accepts Arabic or English digits, spaces, dashes, and the +20 / 0020 / 20 prefixes.
 */
export function normalizeEgyptPhone(input: string): string | null {
  let digits = toAscii(input).replace(/[^\d+]/g, "");
  digits = digits.replace(/^\+?(00)?20/, "0");
  if (!digits.startsWith("0")) digits = `0${digits}`;
  return /^01[0125]\d{8}$/.test(digits) ? digits : null;
}

/** 01012345678 shown as 0101 234 5678. */
export function formatPhone(phone: string): string {
  return phone.replace(/^(\d{4})(\d{3})(\d{4})$/, "$1 $2 $3");
}

/** wa.me link for the team to message a customer (number in international form). */
export function whatsappLink(phone: string, text?: string): string {
  const intl = `20${phone.replace(/^0/, "")}`;
  return `https://wa.me/${intl}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
