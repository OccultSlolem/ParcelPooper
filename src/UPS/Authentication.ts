import { UPSError, isUPSError } from "./UPSTypes";

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

function isCreateTokenRequestResponse(
  obj: any
): obj is CreateTokenRequestResponse {
  return (
    obj &&
    typeof obj.tokenType === "string" &&
    typeof obj.issuedAt === "string" &&
    typeof obj.clientId === "string" &&
    typeof obj.accessToken === "string" &&
    typeof obj.expiresIn === "number" &&
    typeof obj.status === "string" &&
    (typeof obj.scope === "string" || obj.scope === undefined) &&
    (typeof obj.refreshCount === "number" || obj.refreshCount === undefined)
  );
}

/**
 * Creates a bearer token for the UPS API. Must have the authorization product
 * enabled on your UPS app (which is required for all apps).
 * 
 * @param accountNumber Your UPS account number (the one you use for shipping)
 * @param clientId Your UPS app's client ID
 * @param clientSecret Your UPS app's client secret
 * @param isCIE If true, uses the UPS CIE environment instead of production
 * @returns A promise that resolves to the bearer token, or an error
 * @throws An error if the request fails or the response is invalid
 */
export async function createBearerToken(
  accountNumber: string,
  clientId: string,
  clientSecret: string,
  isCIE?: boolean
): Promise<CreateTokenRequestResponse | UPSError> {
  const encodedCredentials = btoa(`Basic ${clientId}:${clientSecret}`);
  const body = new URLSearchParams({
    grant_type: "client_credentials",
  });
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-merchant-id": accountNumber,
      Authorization: encodedCredentials,
    },
    body,
  };

  const response = await fetch(
    isCIE
      ? "https://wwwcie.ups.com/security/v1/oauth/token"
      : "https://onlinetools.ups.com/security/v1/oauth/token",
    requestOptions
  );

  if (!response.ok) {
    // Check if the response is a UPS error
    const error = await response.json();
    if (isUPSError(error)) {
      return error;
    }
    throw new Error(
      `Failed to create bearer token: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  if (!isCreateTokenRequestResponse(data)) {
    throw new Error(
      `Failed to create bearer token: Invalid response from server`
    );
  }

  return data;
}
