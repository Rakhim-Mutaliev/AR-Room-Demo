export type PlacementType =
  | 'floor'
  | 'wall'
  | 'ceiling'
  | 'surface-floor'
  | 'surface-wall'
  | 'surface-ceiling'

export type AssetCategory = 'furniture' | 'wall' | 'ceiling' | 'material'

export type ARAsset = {
  id: string
  name: string
  shortName: string
  category: AssetCategory
  placementType: PlacementType
  modelUrl?: string
  textureUrl?: string
  color: string
  defaultScale: number
  minimumScale: number
  maximumScale: number
  realSize: { width: number; height: number; depth: number }
}

export type SceneTransform = {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

export type SceneObject = SceneTransform & {
  id: string
  assetId: string
  placementType: PlacementType
}
