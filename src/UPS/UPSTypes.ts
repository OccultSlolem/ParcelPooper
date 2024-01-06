// --- General UPS Types ---

export const UPS_PROD_URL = 'https://onlinetools.ups.com';
export const UPS_CIE_URL = 'https://wwwcie.ups.com';

export interface UPSErrorDetail {
  code: string;
  message: string;
}

export interface UPSError { // Also used for shipment warnings
  errors: UPSErrorDetail[];
}

export function isUPSError(obj: any): obj is UPSError {
  return (
    obj &&
    Array.isArray(obj.errors) &&
    obj.errors.every((error: any) => {
      return (
        typeof error.code === 'string' &&
        typeof error.message === 'string'
      );
    })
  );
}

// --- UPS Tracking API ---

export interface UPSTrackingResponse {
  trackResponse: {
    shipment: UPSTrackingShipment[];
  }
}

export interface UPSTrackingShipment {
  inquiryNumber: string; // Usually the tracking number
  package: UPSTrackingPackage[]; // Spelled singular, but it's an array
  userRelation?: string[];
  warnings?: UPSError[];
}

export interface UPSAccessPointInformation {
  pickupByDate: string; // YYYYMMDD
}

export interface UPSTrackingMilestone {
  category: string;
  code: string;
  current: boolean;
  description: string;
  linkedActivity: string;
  state: string; // Not sure if this means state as in state/province or state as in status
  subMilestone?: {
    category: string;
  }
}

export interface UPSPaymentInformation {
  amount: string;
  currency: string;
  id: string;
  paid: boolean;
  paymentMethod: string;
  type: string;
}

export interface UPSReferenceNumber {
  number: string;
  type: string;
}

export interface UPSService {
  code: string;
  description: string;
  levelCode: string;
}

export interface UPSDeliveryInformation {
  deliveryPhoto?: {
    isNonPostalCodeCountry: boolean;
    photo: string;
    photoCaptureInd: string; // Presumably ind = indicator
    photoDispositionCode: string;
  }
  location?: string;
  receivedBy?: string;
  signature?: {
    image: string;
  }
}

export interface UPSTrackingPackage {
  accessPointInformation?: UPSAccessPointInformation;
  activity: UPSTrackingActivity[];
  additionalAttributes?: string[];
  alternateTrackingNumber?: {
    number: string;
    type: string;
  }
  currentStatus?: {
    code: string;
    description: string;
    simplifiedTextDescription: string;
    statusCode: string;
    type: string;
  }
  deliveryDate: UPSTrackingDeliveryDate[];
  deliveryInformation?: UPSDeliveryInformation;
  deliveryTime?: {
    type: string;
    endTime?: string; // HHMMSS
    startTime: string; // HHMMSS
  }
  milestones?: UPSTrackingMilestone[];
  packageAddress?: UPSPackageAddress[];
  packageCount: number; // Most numbers in the UPS API are strings, but this one is a number
  paymentInformation?: UPSPaymentInformation[];
  referenceNumber?: UPSReferenceNumber[];
  service?: UPSService;
  statusCode?: string;
  statusDescription?: string;
  suppressionIndicators?: string[];
  trackingNumber: string;
  weight?: {
    unitOfMeasurement: string;
    weight: string;
  };
}

export interface UPSTrackingDeliveryDate {
  type: string;
  date: string; // YYYYMMDD
}

export interface UPSAddress {
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  city: string;
  country: string;
  countryCode: string;
  postalCode: string;
  stateProvince: string;
}

export interface UPSPackageAddress {
  address: UPSAddress;
  attentionName?: string;
  name: string;
  type: string;
}

export interface UPSTrackingActivity {
  location: {
    address: {
      city: string;
      stateProvince: string;
      countryCode: string;
      country: string;
    }
    slic: string; // Service Location ID Code (UPS's internal ID for the location)
  }
  status: {
    type: string;
    description: string;
    code: string;
    statusCode: string;
  }
  date: string; // YYYYMMDD
  time: string; // HHMMSS
  gmtDate?: string; // YYYYMMDD
  gmtOffset?: string; // HHMM
  gmtTime?: string; // HHMMSS
}

export function isUPSTrackingResponse(obj: any): obj is UPSTrackingResponse {
  return (
    obj &&
    typeof obj.trackResponse === 'object' &&
    Array.isArray(obj.trackResponse.shipment) &&
    obj.trackResponse.shipment.every((shipment: any) => {
      return isUPSTrackingShipment(shipment);
    })
  );
}

export function isUPSTrackingShipment(obj: any): obj is UPSTrackingShipment {
  return (
    obj &&
    typeof obj.inquiryNumber === 'string' &&
    Array.isArray(obj.package) &&
    obj.package.every((packageObj: any) => {
      return isUPSTrackingPackage(packageObj);
    })
  );
}

export function isUPSTrackingPackage(obj: any): obj is UPSTrackingPackage {
  return (
    obj &&
    Array.isArray(obj.activity) &&
    obj.activity.every((activity: any) => {
      return isUPSTrackingActivity(activity);
    }) &&
    Array.isArray(obj.deliveryDate) &&
    obj.deliveryDate.every((deliveryDate: any) => {
      return isUPSTrackingDeliveryDate(deliveryDate);
    }) &&
    typeof obj.packageCount === 'number' &&
    typeof obj.trackingNumber === 'string'
  );
}

export function isUPSTrackingActivity(obj: any): obj is UPSTrackingActivity {
  return (
    obj &&
    typeof obj.date === 'string' &&
    typeof obj.time === 'string' &&
    typeof obj.status === 'object' &&
    typeof obj.location === 'object'
  );
}

export function isUPSTrackingDeliveryDate(obj: any): obj is UPSTrackingDeliveryDate {
  return (
    obj &&
    typeof obj.date === 'string' &&
    typeof obj.type === 'string'
  );
}
