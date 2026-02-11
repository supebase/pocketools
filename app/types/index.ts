import type { RecordModel } from 'pocketbase'

export interface User extends RecordModel {
  id: string
  name: string
  email: string
  avatar: string
  created: string
  updated: string
}

export interface Posts extends RecordModel {
  content: string
  expand?: {
    user: User
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
