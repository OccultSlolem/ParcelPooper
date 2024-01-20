// --- General UPS Types ---

import { TrackingStatus } from "../GlobalTypes";

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

export interface UPSTrackingStatusMessage {
  description: string;
  shorthandStatus: TrackingStatus;
  delivered?: boolean;
  delayed?: boolean;
  inTransit?: boolean;
  exception?: boolean;
  outForDelivery?: boolean;
  returnToSender?: boolean;
  shipperActionRequired?: boolean;
  recipientShouldPickUp?: boolean;
  recipientShouldCheckUPS?: boolean;
  recipientActionRequired?: boolean;
}

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

export interface UPSPackageAddress {
  address: {
    addressLine1: string;
    addressLine2?: string;
    addressLine3?: string;
    city: string;
    country: string;
    countryCode: string;
    postalCode: string;
    stateProvince: string;
  };
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

// --- UPS Rating API ---

/**
 * Used to define the request type for the Rating API. The options are:
 * - Rate: Retrieves rates for a shipment
 * - Shop: The API validates the shipment, and returns rates for all UPS products from the ShipFrom to the ShipTo addresses
 * - Ratetimeintransit: Retrieves the time in transit for a shipment
 * - informationShoptimeintransit: The server validates the shipment, and returns rates and transit times for all UPS products from the ShipFrom to the ShipTo addresses.
 * 
 * For UPS Ground Freight pricing requests, the only valid option is Rate.
 * 
 * Blame UPS for the weird capitalization.
 */
type UPSRequestOption = 'Rate' | 'Shop' | 'Ratetimeintransit' | 'informationShoptimeintransit';

interface UPSRateAddress {
  AddressLine: string[];
  City: string;
  StateProvinceCode?: string;
  PostalCode?: string;
  CountryCode: string;
}

interface UPSRateAddressWithResidentialIndicator extends UPSRateAddress {
  ResidentialAddressIndicator?: string;
}

interface UPSRateAddressWithResidentialIndicatorAndPOBoxIndicator extends UPSRateAddressWithResidentialIndicator {
  POBoxIndicator?: string;
}

interface CodeDescriptionPair {
  Code: string;
  Description: string;
}

interface CodeOptionalDescriptionPair {
  Code: string;
  Description?: string;
}

interface UPSRateCurrencyMonetaryValue {
  CurrencyCode: string;
  MonetaryValue: string;
}

interface UPSRateDeliveryOptions {
  LiftGateAtPickupIndicator?: string;
  HoldForPickupIndicator?: string;
}

export interface UPSRateRequest {
  Request: {
    RequestOption: UPSRequestOption;
    SubVersion?: '1601' | '1607' | '1701' | '1707' | '2108' | '2205'; // Presumably best to use the latest version
    TransactionReference?: {
      CustomerContext?: string;
    }
  };
  PickupType?: {
    Code: string; // Two-digit code
    Description?: string;
  };
  CustomerClassification?: {

  };
  Shipment: {
    OriginRecordTransactionTimestamp?: string;
    Shipper: {
      Name?: string;
      AttentionName?: string;
      ShipperNumber?: string;
      Address: UPSRateAddress;
    };
    ShipTo: {
      Name?: string;
      AttentionName?: string;
      Address: UPSRateAddressWithResidentialIndicator;
    };
    ShipFrom?: {
      Name?: string;
      AttentionName?: string;
      Address: UPSRateAddress;
    };
    AlternateDeliveryAddress: {
      Name?: string;
      Address: UPSRateAddressWithResidentialIndicatorAndPOBoxIndicator;
    };
    ShipmentIndicationType?: {
      Code: string;
      Description?: string;
    }[];
    PaymentDetails?: {
      ShipmentCharge: {
        Type: string;
        BillShipper?: {
          AccountNumber: string;
        }
        BillReceiver?: {
          AccountNumber: string;
          Address?: {
            PostalCode?: string;
          }
        }
        BillThirdParty?: {
          AccountNumber: string;
          Address?: UPSRateAddress;
        }
      }[];
      ConsigneeBilledIndicator?: string;
    };
    FRSPaymentInformation?: {
      Type: {
        Code: string;
        Description?: string;
      };
      AccountNumber: string;
      Address?: {
        PostalCode?: string;
        CountryCode: string;
      };
    };
    FreightShipmentInformation?: {
      FreightDensityInfo?: {
        AdjustedHeightIndicator?: string;
        AdjustedHeight?: {
          Value: string;
          UnitOfMeasurement: {
            Code: string;
            Description?: string;
          };
        }
        HandlingUnits: {
          Quantity: string;
          Type: {
            Code: string;
            Description?: string;
          };
          Dimensions: {
            UnitOfMeasurement: {
              Code: string;
              Description: string;
            };
            Length: string;
            Width: string;
            Height: string;
          }[];
        }
      }
      DesnityEligibleIndicator?: string;
    };
    GoodsNotInFreeCirculationIndicator?: string;
    Service?: {
      Code: string;
      Description?: string;
    };
    NumOfPieces?: string;
    ShipmentTotalWeight?: {
      UnitOfMeasurement: {
        Code: string;
        Description: string;
      };
      Weight: string;
    };
    DocumentsOnlyIndicator?: string;
    Package: {
      PackagingType: CodeOptionalDescriptionPair;
      Dimensions?: {
        UnitOfMeasurement: CodeDescriptionPair;
        Length: string;
        Width: string;
        Height: string;
      };
      DimWeight?: {
        UnitOfMeasurement: CodeDescriptionPair;
        Weight: string;
      };
      PackageWeight?: {
        UnitOfMeasurement: CodeDescriptionPair;
        Weight: string;
      };
      Commodity?: {
        FreightClass: string;
        NMFC?: {
          PrimeCode: string;
          SubCode?: string;
        }
      };
      LargePackageIndicator?: string;
      PackageServiceOptions?: {
        DeliveryConfirmation?: {
          DCISType: '1' | '2' | '3';
        };
        AccessPointCOD?: UPSRateCurrencyMonetaryValue;
        COD?: {
          CODFundsCode: string;
          CODAmount: UPSRateCurrencyMonetaryValue;
        };
        DeclaredValue?: UPSRateCurrencyMonetaryValue;
        ShipperDeclaredValue?: UPSRateCurrencyMonetaryValue;
        ShipperReleaseIndicator?: string;
        ProactiveIndicator?: string;
        RefrigerationIndicator?: string;
        UPSPremiumCareIndicator?: string;
        HazMat?: {
          PackageIdentifier?: string;
          QValue?: string;
          OverPackedIndicator?: string;
          AllPackedInOneIndicator?: string;
          HazMatChemicalRecord: {
            ChemicalRecordIndicator?: string;
            ClassDivisionNumber?: string;
            IDNumber?: string;
            TransportationMode: '01' | '02' | '03' | '04';
            RegulationSet: 'ADR' | 'CFR' | 'IATA' | 'TDG';
            EmergencyPhone?: string;
            EmergencyContact?: string;
            ReportableQuantity?: 'LQ' | 'EQ' | 'RQ';
            SubRiskClass?: string;
            PackagingGroupType?: string;
            Quantity?: string;
            UOM?: string; // Unit of measurement
            PackagingInstructionCode?: string;
            ProperShippingName?: string;
            TechnicalName?: string;
            AdditionalDescription?: string;
            PackagingType?: string;
            HazardLabelRequired?: string;
            PackagingTypeQuantity?: string;
            CommodityRegulatedLevelCode?: 'LR' | 'FR' | 'LQ' | 'EQ';
            TransportCategory?: '0' | '1' | '2' | '3' | '4';
            TunnelRestrictionCode?: string;
          }[];
        };
        DryIce?: {
          RegulationSet: 'CFR' | 'IATA';
          DryIceWeight: {
            UnitOfMeasurement: {
              Code: '00' | '01';
              Description: string;
            }
            Weight: string;
          }
          MedicalUseIndicator?: string;
          AuditRequired?: string;
        }
      }
    }[];
    ShipmentServiceOptions?: {
      SaturdayPickupIndicator?: string;
      SaturdayDeliveryIndicator?: string;
      SundayDeliveryIndicator?: string;
      AvailableServicesOption?: '1' | '2' | '3';
      AccessPointCOD?: '01';
      DeliverToAddresseeOnlyIndicator?: '01';
      DirectDeliveryOnlyIndicator?: '01' | '02';
      COD?: {
        CODFundsCode: string; // Refer to Rating and Shipping COD Supported Countries or Territories
        CODAmount: UPSRateCurrencyMonetaryValue;
      };
      DeliveryConfirmation?: {
        DCISType: '1' | '2';
      };
      ReturnOfDocumentIndicator?: string;
      UPScarbonneutralindicator?: string; // UPS capitalized it like this, not me
      CertificateOfOriginIndicator?: string;
      PickupOptions?: UPSRateDeliveryOptions;
      DeliveryOptions?: UPSRateDeliveryOptions;
      RestrictedArticles?: {
        AlcoholicBeveragesIndicator?: string;
        DiagnosticSpecimensIndicator?: string;
        PerishablesIndicator?: string;
        PlantsIndicator?: string;
        SeedsIndicator?: string;
        SpecialExceptionsIndicator?: string;
        TobaccoIndicator?: string;
        ECigarettesIndicator?: string;
        HempCBDIndicator?: string;
      }
      ShipperExportDeclarationIndicator?: string;
      CommercialInvoiceRemovalIndicator?: string;
      ImportControl?: {
        Code: '01' | '02' | '03' | '04' | '05';
        Description?: string;
      };
      ReturnService?: CodeOptionalDescriptionPair;
      SDLShipmentIndicator?: string;
      EPRAIndicator?: string;
      InsideDelivery?: '01' | '02' | '03';
      ItemDisposalIndicator?: string;
    };
    ShipmentRatingOptions?: {
      NegotiatedRatesIndicator?: string;
      FRSShipmentIndicator?: string;
      RateChartIndicator?: string;
      UserLevelDiscountIndicator?: string;
      TPFCNegotiatedRatesIndicator?: string;
    };
    InvoiceLineTotal?: UPSRateCurrencyMonetaryValue;
    RatingMethodRequestedIndicator?: string;
    TaxInformationIndicator?: string;
    PromotionalDiscountInformation?: {
      PromoCode: string;
      PromoAliasCode: string;
    };
    DeliveryTimeInformation?: {
      PackageBillType: '02' | '03' | '04' | '07';
      Pickup?: {
        Date?: string; // YYYYMMDD
        Time?: string; // HHMMSS
      };
      ReturnContractServices?: {
        Code: '01';
        Description?: string;
      };
    };
    MasterCartonIndicator?: string;
    WWEShipmentIndicator?: string;
  };
};
