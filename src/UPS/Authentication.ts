import { UPS_CIE_URL, UPS_PROD_URL, isUPSError } from "./UPSTypes";

interface CreateTokenRequestResponse {
  tokenType: string;
  issuedAt: string;
  clientId: string;
  accessToken: string;
  expiresIn: number;
  status: string;
  scope?: string;
  refreshCount?: number;
}

export function isCreateTokenRequestResponse(
  obj: any
): obj is CreateTokenRequestResponse {
  return (
    obj &&
    typeof obj.tokenType === "string" &&
    typeof obj.issuedAt === "string" &&
    typeof obj.clientId === "string" &&
    typeof obj.accessToken === "string" &&
    typeof obj.expiresIn === "string" &&
    typeof obj.status === "string" &&
    (typeof obj.scope === "string" || obj.scope === undefined) &&
    (typeof obj.refreshCount === "string" || obj.refreshCount === undefined)
  );
}

/**
 * The UPS API returns all keys in snake_case, but we want camelCase. This
 * function converts all keys in an object to camelCase.
 * @param obj The object to convert
 * @returns The object with all keys converted to camelCase
 */
function toCamelCase(obj: any): any {
  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }

  return Object.keys(obj).reduce((result: any, key: string) => {
    const camelCaseKey = key.replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
    result[camelCaseKey] = toCamelCase(obj[key]);
    return result;
  }, {});
}

/**
 * Creates an OAuth 2.0 Authorization token for the UPS API. Must have the authorization product
 * enabled on your UPS app (which is required for all apps).
 * 
 * @param accountNumber Your UPS account number (the one you use for shipping)
 * @param clientId Your UPS app's client ID
 * @param clientSecret Your UPS app's client secret
 * @param isCIE If true, uses the UPS CIE environment instead of production
 * @returns A promise that resolves to the authentication token, or an error
 * @throws An error if the request fails or the response is invalid
 */
export async function generateAuthToken(
  accountNumber: string,
  clientId: string,
  clientSecret: string,
  isCIE?: boolean
): Promise<CreateTokenRequestResponse> {
  const encodedCredentials = btoa(`${clientId}:${clientSecret}`);
  const body = new URLSearchParams({
    grant_type: "client_credentials",
  });
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-merchant-id": accountNumber,
      Authorization: `Basic ${encodedCredentials}`,
    },
    body,
  };

  const url = (isCIE ? UPS_CIE_URL : UPS_PROD_URL) + '/security/v1/oauth/token';

  const response = await fetch(
    url,
    requestOptions
  );

  if (!response.ok) {
    // Check if the response is a UPS error
    const error = await response.json();
    if (isUPSError(error)) {
      throw new Error(`Received authentication error(s) from UPS: ${error.errors.map((e) => e.message).join(', ')}`);
    }
    throw new Error(
      `Failed to create authentication token: ${response.status} ${response.statusText}`
    );
  }

  const data = toCamelCase(await response.json());
  if (!isCreateTokenRequestResponse(data)) {
    throw new Error(
      `Failed to create authentication token: Invalid response from server`
    );
  }

  return data;
}
