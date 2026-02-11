import type { RecordModel } from 'pocketbase'

export interface Posts extends RecordModel {
  content: string
  expand?: {
    user: any
  }
}

export interface Comments {
  id: string
  post: string
  comment: string
  email: string
  location: string
  isp: string
  created: string
  updated: string
}

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
