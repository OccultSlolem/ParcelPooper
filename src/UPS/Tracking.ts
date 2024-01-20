import { generateAuthToken } from './Authentication';
import {
  UPSTrackingResponse,
  UPSTrackingStatusMessage,
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

export function statusCodeToMessage(statusCode: string): UPSTrackingStatusMessage {
  switch (statusCode) {
    case '013':
      return {
        description: 'Delivery Exception.',
        shorthandStatus: 'exception',
        exception: true,
      }
    case '048':
      return {
        description: 'Delay in Delivery.',
        shorthandStatus: 'delay',
        delayed: true,
        inTransit: true,
      }
    case '005':
      return {
        description: 'In Transit.',
        shorthandStatus: 'in_transit',
        inTransit: true,
      }
    case '032':
      return {
        description: 'Adverse weather may cause delay.',
        shorthandStatus: 'in_transit',
        delayed: true,
        inTransit: true,
      }
    case '040':
      return {
        description: 'Delivered to UPS Access Point™, awaiting customer pickup.',
        shorthandStatus: 'available_for_pickup',
        recipientShouldPickUp: true,
        delivered: true,
      }
    case '055':
      return {
        description: 'Delivery will be rescheduled.',
        shorthandStatus: 'delay',
        delayed: true,
        inTransit: true,
      }
    case '003':
      return {
        description: 'Information Received - Awaiting Drop Off.',
        shorthandStatus: 'awaiting_pickup',
      }
    case '065':
      return {
        description: 'Pickup Attempted.',
        shorthandStatus: 'delay',
        recipientShouldCheckUPS: true,
        delayed: true,
        inTransit: true,
      }
    case '057':
      return {
        description: 'UPS missed the reciever and is taking the package to a UPS Access Point™.',
        shorthandStatus: 'delay',
        delayed: true,
        inTransit: true,
      }
    case '051':
    case '052':
    case '053':
      return {
        description: 'Delay due to an emergency situation, severe weather, or natural disaster.',
        shorthandStatus: 'delay',
        delayed: true,
        inTransit: true,
      }
    case '006':
      return {
        description: 'Out For Delivery Today.',
        shorthandStatus: 'out_for_delivery',
        outForDelivery: true,
        inTransit: true,
      }
    case '011':
      return {
        description: 'Delivered.',
        shorthandStatus: 'delivered',
        delivered: true,
      }
    case '054': 
      return {
        description: 'Delivery Change Requested.',
        shorthandStatus: 'delay',
        delayed: true,
        inTransit: true,
      }
    case '022': 
      return {
        description: 'UPS missed the reciever and will try again on the next business day.',
        shorthandStatus: 'delay',
        delayed: true,
        inTransit: true,
      }
    case '027': 
      return {
        description: 'UPS has received a request to deliver the package to an alternate address.',
        shorthandStatus: 'in_transit',
        inTransit: true, // Unlike code 054, UPS marks this as an update and not a delay
      }
    case '024': 
      return {
        description: 'UPS was unable to deliver the package on the final delivery attempt. Air service packages will be held for 5 days - all other packages will be returned to the sender unless action is taken by the receiver by end of day.',
        shorthandStatus: 'delay',
        recipientShouldCheckUPS: true,
        recipientActionRequired: true,
        delayed: true,
        inTransit: true,
      }
    case '016': 
      return {
        description: 'UPS is holding the cargo at a secure facility, pending instructions and agreement.',
        shorthandStatus: 'delay',
        recipientShouldCheckUPS: true,
        shipperActionRequired: true,
        recipientActionRequired: true,
        delayed: true,
        inTransit: true,
      }
    case '018': 
      return {
        description: 'Hold for pickup was requested - the package is not yet available for pickup at a UPS facility.',
        shorthandStatus: 'in_transit',
        inTransit: true,
      }
    case '070': 
      return {
        description: 'Package is on its way to a Local UPS Access Point™ for pickup.',
        shorthandStatus: 'in_transit',
        inTransit: true,
      }
    case '042': 
      return {
        description: 'Service was upgraded while in transit',
        shorthandStatus: 'in_transit',
        inTransit: true,
      }
    case '021': 
      return {
        description: 'Out for Delivery Today.',
        shorthandStatus: 'out_for_delivery',
        outForDelivery: true,
        inTransit: true,
      }
    case '019': 
      return {
        description: 'Held for future delivery.',
        shorthandStatus: 'delay',
        delayed: true,
        inTransit: true,
      }
    case '030':
      return {
        description: 'Local post office exception. Please check with you local post office for more information.',
        shorthandStatus: 'exception',
        exception: true,
      }
    case '035':
      return {
        description: 'Returning to Sender.',
        shorthandStatus: 'return_to_sender',
        returnToSender: true,
      }
    case '029': 
      return {
        description: 'Action Required: The shipping address provided is either incorrect or incomplete.',
        shorthandStatus: 'exception',
        recipientActionRequired: true,
        exception: true,
      }
    case '028': 
      return {
        description: 'UPS has updated the delivery address.',
        shorthandStatus: 'in_transit',
        inTransit: true,
      }
    case '050':
      return {
        description: 'Action Required: Please provide UPS with the correct delivery information or the package will be returned to the sender.',
        shorthandStatus: 'exception',
        recipientActionRequired: true,
        exception: true,
      }
  
    case '049':
      return {
        description: 'Action required by the receiver.',
        shorthandStatus: 'exception',
        recipientActionRequired: true,
        exception: true,
      }
    case '012': 
      return {
        description: 'Customs clearance in Progress.',
        shorthandStatus: 'in_transit',
        inTransit: true,
      }
    case '058':
      return {
        description: 'Customs clearance information required.',
        shorthandStatus: 'delay',
        shipperActionRequired: true,
        delayed: true,
      }
    case '014':
      return {
        description: 'Package Cleared Customs.',
        shorthandStatus: 'in_transit',
        inTransit: true,
      }
    case '033': 
      return {
        description: 'UPS has received a request to return the package to the sender.',
        shorthandStatus: 'return_to_sender',
        returnToSender: true,
      }
    case '044':
    case '045':
      return {
        description: 'The Package is on its way to UPS. Delivery date will be updated when UPS takes possession of the package',
        shorthandStatus: 'awaiting_pickup',
        inTransit: true,
      }
    case '029':
      return {
        description: 'Second delivery attempt was made. UPS will make a final attempt to deliver the package on the next business day.',
        shorthandStatus: 'delay',
        delayed: true,
        inTransit: true,
      }
    case '025':
      return {
        description: 'The package was transferred to the local post office for delivery to the final destination.',
        shorthandStatus: 'in_transit',
        inTransit: true,
      }
    case '017': 
      return {
        description: 'The package is being held upon request for 5 business days and is ready for pickup. A valid government issued photo ID will be required for pickup.',
        shorthandStatus: 'available_for_pickup',
        recipientShouldPickUp: true,
      }
    case '072':
      return {
        description: 'The package has been loaded onto the delivery vehicle and is out for delivery.',
        shorthandStatus: 'out_for_delivery',
        outForDelivery: true,
        inTransit: true,
      }
    case '077':
      return {
        description: 'The package is scheduled for pickup today.',
        shorthandStatus: 'awaiting_pickup',
        recipientShouldPickUp: true,
      }
    case '046':
      return {
        description: 'UPS has placed the perishable package in a climate controlled environment for safety.',
        shorthandStatus: 'delay',
        delayed: true,
        inTransit: true,
      }
    case '047':
      return {
        description: 'UPS has removed the package from a climate controlled environment.',
        shorthandStatus: 'in_transit',
        delayed: true,
        inTransit: true,
      }
    case '007':
      return {
        description: 'Shipment was cancelled.',
        shorthandStatus: 'exception',
        exception: true,
      }
    case '038':
      return {
        description: 'Shipment was picked up', // by who? UPS marks this as in transit so I'm assuming it's them
        shorthandStatus: 'in_transit',
        inTransit: true,
      }
    case '026':
      return {
        description: 'Package was delivered by local post office.',
        shorthandStatus: 'delivered',
        delivered: true,
      }
    case '071':
      return {
        description: 'Package has arrived at destination facility and is being prepared for delivery today.',
        shorthandStatus: 'out_for_delivery',
        inTransit: true,
      }
    default:
      return {
        description: 'Unknown status code - check tracking information on UPS.com for more details.',
        shorthandStatus: 'unknown',
        recipientShouldCheckUPS: true,
      }
  }
}

interface UPSTrackingStatus extends UPSTrackingResponse {
  lastStatus: UPSTrackingStatusMessage;
}

/**
 * Retrieves the tracking status of a UPS package. You will need to provide either an account number, or an authorization token.
 * You can generate an authorization token manually with generateAuthToken(). Providing an account number will automatically
 * call generateAuthToken() for you.
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
export async function getUPSTrackingStatus(
  trackingNumber: string,
  clientID: string,
  clientSecret: string,
  accountNumber?: string,
  locale: string = 'en_US',
  returnMilestones?: boolean,
  returnSignature?: boolean,
  authorizationToken?: string,
  isCIE?: boolean
): Promise<UPSTrackingStatus> {
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
      throw new Error(`Received tracking error from UPS: ${error.errors[0].message}`);
    }
    throw new Error(
      `Failed to get tracking status: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (isUPSError(data)) {
    throw new Error(`Received tracking error from UPS: ${data.errors[0].message}`);
  }

  if (!isUPSTrackingResponse(data)) {
    throw new Error(
      `Failed to get tracking status: Invalid response from server`
    );
  }

  const returnValue: UPSTrackingStatus = {
    trackResponse: data.trackResponse,
    lastStatus: statusCodeToMessage(data.trackResponse.shipment[0].package[0].activity[0].status.statusCode),
  }

  return returnValue;
}
