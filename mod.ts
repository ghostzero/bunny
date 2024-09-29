import { encodeBase64 } from "@std/encoding";
import { crypto } from "@std/crypto";

/**
 * Add countries to the URL
 *
 * @param url - The URL to add the countries to
 * @param countriesAllowed - The countries allowed
 * @param countriesBlocked - The countries blocked
 */
function addCountries(url: string, countriesAllowed: string | null, countriesBlocked: string | null): string {
  let tempUrl = url;

  if (countriesAllowed != null) {
    const tempUrlOne = new URL(tempUrl);
    tempUrl += ((tempUrlOne.search === "") ? "?" : "&") + "token_countries=" + countriesAllowed;
  }

  if (countriesBlocked != null) {
    const tempUrlTwo = new URL(tempUrl);
    tempUrl += ((tempUrlTwo.search === "") ? "?" : "&") + "token_countries_blocked=" + countriesBlocked;
  }

  return tempUrl;
}

/**
 * Generate signed URL
 *
 * @param url - The URL to sign
 * @param securityKey - The security token
 * @param expirationTime - The expiration time in seconds
 * @param userIp - The user IPv4 address
 * @param isDirectory - Whether the URL is a directory
 * @param pathAllowed - The path allowed
 * @param countriesAllowed - The countries allowed
 * @param countriesBlocked - The countries blocked
 */
export async function signUrl(
    url: string,
    securityKey: string,
    expirationTime = 3600,
    userIp: string | null = null,
    isDirectory = false,
    pathAllowed = "",
    countriesAllowed: string | null = null,
    countriesBlocked: string | null = null
): Promise<string> {
  let parameterData = "", parameterDataUrl = "", signaturePath = "", hashableBase = "", token = "";

  const expires = Math.floor(Date.now() / 1000) + expirationTime;
  url = addCountries(url, countriesAllowed, countriesBlocked);
  const parsedUrl = new URL(url);
  const parameters = parsedUrl.searchParams;

  if (pathAllowed !== "") {
    signaturePath = pathAllowed;
    parameters.set("token_path", signaturePath);
  } else {
    signaturePath = decodeURIComponent(parsedUrl.pathname);
  }

  const sortedParams = new URLSearchParams(parameters);
  sortedParams.sort();

  for (const [key, value] of sortedParams.entries()) {
    if (value === "") continue;
    if (parameterData.length > 0) parameterData += "&";
    parameterData += `${key}=${value}`;
    parameterDataUrl += `&${key}=${encodeURIComponent(value)}`;
  }

  hashableBase = securityKey + signaturePath + expires + (userIp ?? "") + parameterData;

  const encoder = new TextEncoder();
  const data = encoder.encode(hashableBase);
  await crypto.subtle.digest("SHA-256", data);
  const hash = await crypto.subtle.digest("SHA-256", data);
  token = encodeBase64(hash).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  if (isDirectory) {
    return `${parsedUrl.protocol}//${parsedUrl.host}/bcdn_token=${token}${parameterDataUrl}&expires=${expires}${parsedUrl.pathname}`;
  } else {
    return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}?token=${token}${parameterDataUrl}&expires=${expires}`;
  }
}
