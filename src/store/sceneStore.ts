import { create } from 'zustand'
import { getAsset } from '../data/assets'
import type { SceneObject, SceneTransform } from '../types/assets'

type SceneState = {
  objects: SceneObject[]
  selectedId: string | null
  pendingAssetId: string
  pickerOpen: boolean
  addObject: (assetId: string, transform: Partial<SceneTransform>) => string
  selectObject: (id: string | null) => void
  setPendingAsset: (id: string) => void
  setPickerOpen: (open: boolean) => void
  updateObject: (id: string, patch: Partial<SceneTransform>) => void
  scaleObject: (id: string, delta: number) => void
  rotateObject: (id: string, delta: number) => void
  replaceObject: (id: string, assetId: string) => void
  duplicateObject: (id: string) => void
  removeObject: (id: string) => void
  clearScene: () => void
}

let nextId = 1

export const clampScale = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))

export const useSceneStore = create<SceneState>((set, get) => ({
  objects: [], selectedId: null, pendingAssetId: 'sofa', pickerOpen: false,
  addObject: (assetId, transform) => {
    const asset = getAsset(assetId)
    if (!asset) throw new Error(`Unknown asset: ${assetId}`)
    const id = `object-${nextId++}`
    const object: SceneObject = {
      id, assetId, placementType: asset.placementType,
      position: transform.position ?? [0, 0, -2],
      rotation: transform.rotation ?? [0, 0, 0],
      scale: transform.scale ?? asset.defaultScale,
    }
    set((state) => ({ objects: [...state.objects, object], selectedId: id }))
    return id
  },
  selectObject: (selectedId) => set({ selectedId }),
  setPendingAsset: (pendingAssetId) => set({ pendingAssetId, pickerOpen: false }),
  setPickerOpen: (pickerOpen) => set({ pickerOpen }),
  updateObject: (id, patch) => set((state) => ({ objects: state.objects.map((object) => object.id === id ? { ...object, ...patch } : object) })),
  scaleObject: (id, delta) => set((state) => ({ objects: state.objects.map((object) => {
    if (object.id !== id) return object
    const asset = getAsset(object.assetId)!
    return { ...object, scale: clampScale(object.scale * delta, asset.minimumScale, asset.maximumScale) }
  }) })),
  rotateObject: (id, delta) => set((state) => ({ objects: state.objects.map((object) => object.id === id ? { ...object, rotation: [object.rotation[0], object.rotation[1] + delta, object.rotation[2]] } : object) })),
  replaceObject: (id, assetId) => set((state) => ({ objects: state.objects.map((object) => {
    if (object.id !== id) return object
    const asset = getAsset(assetId)
    if (!asset) return object
    return { ...object, assetId, placementType: asset.placementType, scale: clampScale(object.scale, asset.minimumScale, asset.maximumScale) }
  }) })),
  duplicateObject: (id) => {
    const source = get().objects.find((object) => object.id === id)
    if (!source) return
    get().addObject(source.assetId, { ...source, position: [source.position[0] + .18, source.position[1], source.position[2] + .12] })
  },
  removeObject: (id) => set((state) => ({ objects: state.objects.filter((object) => object.id !== id), selectedId: state.selectedId === id ? null : state.selectedId })),
  clearScene: () => set({ objects: [], selectedId: null }),
}))
