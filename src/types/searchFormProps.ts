export interface SearchFormProps {
  onSearch: (filters: {
    city: string;
    region: string;
    wifi: boolean;
    equeue: boolean;
    service?: string;
    worksNow?: boolean;
    worksOnWeekend?: boolean;
    is24Hours?: boolean;
  }) => void;
  regions: string[];
  citiesByRegion: Record<string, Set<string>>;
  allCities: string[];
  services: string[];
}