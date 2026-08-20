import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new GLTFLoader()

export const loadModel = async (url: string) => {
  const gltf = await loader.loadAsync(url)
  const root = gltf.scene
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.castShadow = true
    child.receiveShadow = true
    child.geometry = child.geometry.clone()
    if (Array.isArray(child.material)) child.material = child.material.map((material) => material.clone())
    else child.material = child.material.clone()
  })
  return root
}
