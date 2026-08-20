import * as THREE from 'three'
import type { ARAsset } from '../types/assets'

export const createMaterialSurface = async (asset: ARAsset) => {
  const texture = await new THREE.TextureLoader().loadAsync(asset.textureUrl!)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 2)
  texture.colorSpace = THREE.SRGBColorSpace
  const geometry = new THREE.PlaneGeometry(asset.realSize.width, asset.realSize.height)
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: .86, side: THREE.DoubleSide, transparent: true, opacity: .9 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  if (asset.placementType === 'surface-floor') mesh.rotation.x = -Math.PI / 2
  return mesh
}
