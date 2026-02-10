export interface LocationData {
    ip: string;
    location: string;
    isp: string;
}

export interface UseGeoLocationReturn {
    locationData: Ref<LocationData>;
    fetchGeo: () => Promise<void>;
}