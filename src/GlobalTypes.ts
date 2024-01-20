export type TrackingStatus =
  | "awaiting_pickup"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "available_for_pickup"
  | "return_to_sender"
  | "exception"
  | "delay"
  | "unknown";
