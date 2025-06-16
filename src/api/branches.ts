export interface Branch {
  id: string;
  name: string;
  WiFi: boolean;
  equeue: boolean;
  postalAddress: {
    countrySubDivision: string;
    townName: string;
    streetName: string;
    buildingNumber: string;
    geographicCoordinates?: {
      geolocation?: {
        latitude?: string;
        longitude?: string;
      };
    };
  };
  contactDetails?: {
    mobileNumber?: string;
  };
  information?: any[];
}