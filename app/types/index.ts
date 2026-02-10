export interface PathInfo {
  path2d: Path2D
  length: number
  strokeWidth: number
}

export interface LocationData {
  ip: string
  location: string
  isp: string
}

export interface UseGeoLocationReturn {
  locationData: Ref<LocationData>
  fetchGeo: () => Promise<void>
}
