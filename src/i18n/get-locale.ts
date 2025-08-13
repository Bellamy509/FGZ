"use server";
import { cookies } from "next/headers";
import { COOKIE_KEY_LOCALE, SUPPORTED_LOCALES } from "lib/const";

function validateLocale(locale?: string): boolean {
  return SUPPORTED_LOCALES.some((v) => v.code === locale);
}

async function getLocaleFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(COOKIE_KEY_LOCALE)?.value;

  return validateLocale(locale) ? locale : undefined;
}

export async function getLocaleAction() {
  // Always return English as default, prioritizing it over browser language
  const locale = await getLocaleFromCookie();

  // Don't check browser headers for language preference - always default to English
  return locale || "en";
}
