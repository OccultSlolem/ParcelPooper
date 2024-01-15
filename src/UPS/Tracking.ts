import { generateAuthToken } from './Authentication';
import {
  UPSError,
  UPSTrackingResponse,
  UPS_CIE_URL,
  UPS_PROD_URL,
  isUPSError,
  isUPSTrackingResponse,
} from './UPSTypes';

/**
 * Generates a 32 character transaction id
 * @returns A 32 character transaction id
 */
export function generateTransactionId() {
  const length = 32;
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

/**
 * Retrieves the tracking status of a UPS package. You will need to provide either an account number
 * 
 * @param trackingNumber May be called "inquiry number" if the thing you're tracking isn't a single package
 * @param clientID The client ID for your UPS API app
 * @param clientSecret The client secret for your UPS API app
 * @param locale The locale to use for the response. Defaults to en_US if not provided.
 * @param returnMilestones Whether or not to return tracking milestones. Defaults to false if not provided.
 * @param returnSignature Whether or not to return the signature. Defaults to false if not provided.
 * @param accountNumber Your UPS account number (the one you use for shipping). Must be provided if no authorization token is provided.
 * @param authorizationToken An authorization token generated by generateAuthToken(). Must be provided if no account number is provided.
 * @param isCIE Whether or not to use the CIE URL. Defaults to false if not provided.
 * @returns The tracking status of the package, or an error if one occurred
 */
export async function getTrackingStatus(
  trackingNumber: string,
  clientID: string,
  clientSecret: string,
  locale: string = 'en_US',
  returnMilestones?: boolean,
  returnSignature?: boolean,
  accountNumber?: string,
  authorizationToken?: string,
  isCIE?: boolean
): Promise<UPSTrackingResponse | UPSError> {
  let bearerToken = '';
  if (!authorizationToken) {
    if (!accountNumber)
      throw new Error(
        'Account number is required if no authorization token is provided'
      );
    const authResponse = await generateAuthToken(
      accountNumber,
      clientID,
      clientSecret,
      isCIE
    );
    if (isUPSError(authResponse)) return authResponse;
    bearerToken = `Bearer ${authResponse.accessToken}`;
  } else {
    bearerToken = `Bearer ${authorizationToken}`;
  }

  const transId = generateTransactionId();
  const transSrc = isCIE ? 'testing' : 'production';
  const url =
    (isCIE ? UPS_CIE_URL : UPS_PROD_URL) +
    `/api/track/v1/details/${trackingNumber}?locale=${locale}&returnMilestones=${returnMilestones}&returnSignature=${returnSignature}`;
  
  const requestOptions = {
    method: 'GET',
    headers: {
      'transId': transId,
      'transactionSrc': transSrc,
      'isCIE': isCIE ? 'true' : 'false',
      'Authorization': bearerToken,
      'Accept': 'application/json',
    },
  };

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    // Check if the response is a UPS error
    const error = await response.json();
    console.error(error.response.errors[0]);
    if (isUPSError(error)) {
      return error;
    }
    throw new Error(
      `Failed to get tracking status: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!isUPSTrackingResponse(data)) {
    throw new Error(
      `Failed to get tracking status: Invalid response from server`
    );
  }

  return data;
}