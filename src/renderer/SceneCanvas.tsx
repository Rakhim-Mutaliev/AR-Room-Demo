import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { getAsset } from '../data/assets'
import { HitTestManager } from '../ar/HitTestManager'
import { useSceneStore } from '../store/sceneStore'
import type { PlacementType, SceneObject } from '../types/assets'
import { disposeObject } from '../utils/disposeObject'
import { createMaterialSurface } from './MaterialSurface'
import { loadModel } from './ModelLoader'
import { exportScene } from './SceneExporter'

export type SceneCanvasHandle = { capture: () => Promise<Blob> }
type Props = { mode: 'demo' | 'photo' | 'ar'; backgroundUrl?: string; session?: XRSession | null; onStatus: (message: string) => void; onSessionEnd: () => void }

const placementSurface = (type: PlacementType) => type.includes('wall') ? 'wall' : type.includes('ceiling') ? 'ceiling' : 'floor'

const createReticle = () => {
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(.07, .095, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xd9ff57, side: THREE.DoubleSide }),
  )
  reticle.matrixAutoUpdate = false
  reticle.visible = false
  return reticle
}

const addDemoRoom = (scene: THREE.Scene) => {
  const group = new THREE.Group(); group.name = 'demo-room'
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshStandardMaterial({ color: 0xb8aa98, roughness: .92 }))
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; group.add(floor)
  const back = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.8), new THREE.MeshStandardMaterial({ color: 0xdedbd1, roughness: .95 }))
  back.position.set(0, 2.4, -2.5); back.receiveShadow = true; group.add(back)
  const side = back.clone(); side.rotation.y = Math.PI / 2; side.position.set(-4.5, 2.4, 2); group.add(side)
  const grid = new THREE.GridHelper(9, 18, 0x77786f, 0x9c9b92); grid.position.y = .002; (grid.material as THREE.Material).transparent = true; (grid.material as THREE.Material).opacity = .12; group.add(grid)
  scene.add(group)
}

export const SceneCanvas = forwardRef<SceneCanvasHandle, Props>(function SceneCanvas({ mode, backgroundUrl, session, onStatus, onSessionEnd }, ref) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const backgroundRef = useRef(backgroundUrl)
  backgroundRef.current = backgroundUrl

  useImperativeHandle(ref, () => ({
    capture: () => {
      if (!canvasRef.current) throw new Error('Сцена ещё не готова')
      return exportScene(canvasRef.current, backgroundRef.current)
    },
  }), [])

  useEffect(() => {
    const host = hostRef.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: mode !== 'demo', preserveDrawingBuffer: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.xr.enabled = mode === 'ar'
    canvasRef.current = renderer.domElement
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    if (mode === 'demo') { scene.background = new THREE.Color(0x6f746c); scene.fog = new THREE.Fog(0x6f746c, 7, 13); addDemoRoom(scene) }
    const camera = new THREE.PerspectiveCamera(48, host.clientWidth / host.clientHeight, .01, 40)
    camera.position.set(0, 1.55, 4.4); camera.lookAt(0, .85, -1.1)
    scene.add(new THREE.HemisphereLight(0xf7f0dc, 0x51544f, 2.3))
    const light = new THREE.DirectionalLight(0xfff2dc, 3.1); light.position.set(-2.5, 5, 3); light.castShadow = true; light.shadow.mapSize.set(1024, 1024); scene.add(light)
    const reticle = createReticle(); scene.add(reticle)
    const hitTest = new HitTestManager()
    const roots = new Map<string, THREE.Object3D>()
    const loading = new Set<string>()
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const activePointers = new Map<number, { x: number; y: number }>()
    let gestureStart: { distance: number; angle: number } | null = null
    let dragging = false
    let frameHandle = 0
    let disposed = false

    const syncObjects = async (objects: SceneObject[]) => {
      for (const [id, root] of roots) {
        if (!objects.some((object) => object.id === id)) { scene.remove(root); disposeObject(root); roots.delete(id) }
      }
      for (const object of objects) {
        let root = roots.get(object.id)
        if (!root && !loading.has(object.id)) {
          loading.add(object.id)
          const asset = getAsset(object.assetId)
          if (!asset) continue
          try {
            root = asset.modelUrl ? await loadModel(asset.modelUrl) : await createMaterialSurface(asset)
            if (disposed || !useSceneStore.getState().objects.some((item) => item.id === object.id)) { disposeObject(root); continue }
            root.userData.objectId = object.id
            root.traverse((child) => { child.userData.objectId = object.id })
            roots.set(object.id, root); scene.add(root)
          } catch (error) { onStatus(`Не удалось загрузить «${asset.name}»: ${error instanceof Error ? error.message : 'ошибка'}`) }
          finally { loading.delete(object.id) }
        }
        root = roots.get(object.id)
        if (!root) continue
        root.position.fromArray(object.position); root.rotation.fromArray([...object.rotation, 'XYZ']); root.scale.setScalar(object.scale)
        const selected = useSceneStore.getState().selectedId === object.id
        root.traverse((child) => { if (child instanceof THREE.Mesh && 'emissive' in child.material) (child.material as THREE.MeshStandardMaterial).emissiveIntensity = selected ? .16 : 0 })
      }
    }

    const unsubscribe = useSceneStore.subscribe((state) => { void syncObjects(state.objects) })
    void syncObjects(useSceneStore.getState().objects)

    const setRay = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
    }
    const pointOnSurface = (type: PlacementType, clientX: number, clientY: number) => {
      setRay(clientX, clientY)
      const surface = placementSurface(type)
      const plane = surface === 'wall' ? new THREE.Plane(new THREE.Vector3(0, 0, 1), 2.5) : surface === 'ceiling' ? new THREE.Plane(new THREE.Vector3(0, -1, 0), 2.65) : new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const hit = new THREE.Vector3()
      return raycaster.ray.intersectPlane(plane, hit) ? hit : null
    }
    const place = (clientX: number, clientY: number) => {
      const state = useSceneStore.getState(); const asset = getAsset(state.pendingAssetId); if (!asset) return
      const point = mode === 'ar' && reticle.visible
        ? new THREE.Vector3().setFromMatrixPosition(reticle.matrix)
        : pointOnSurface(asset.placementType, clientX, clientY)
      if (!point) { onStatus(`Наведите прицел на ${placementSurface(asset.placementType) === 'floor' ? 'пол' : placementSurface(asset.placementType) === 'wall' ? 'стену' : 'потолок'}`); return }
      if (mode === 'demo') {
        const rect = renderer.domElement.getBoundingClientRect()
        const horizontal = THREE.MathUtils.clamp((clientX - rect.left) / rect.width * 4 - 2, -2, 2)
        const surface = placementSurface(asset.placementType)
        if (surface === 'floor') point.set(horizontal, 0, 0)
        else if (surface === 'wall') point.set(horizontal, THREE.MathUtils.clamp(2.4 - (clientY - rect.top) / rect.height * 2.2, .5, 2.2), -2.42)
        else point.set(horizontal, 2.65, 0)
      }
      if (mode === 'ar' && placementSurface(asset.placementType) === 'wall') { point.y += 1.25; point.z -= .04 }
      if (mode === 'ar' && placementSurface(asset.placementType) === 'ceiling') point.y += 1.8
      const defaultRotation: [number, number, number] = placementSurface(asset.placementType) === 'floor'
        ? [0, Math.PI, 0]
        : [0, 0, 0]
      state.addObject(asset.id, { position: point.toArray(), rotation: defaultRotation })
      onStatus(`«${asset.shortName}» размещён — коснитесь объекта для редактирования`)
    }
    const selectedAt = (clientX: number, clientY: number) => {
      setRay(clientX, clientY)
      const hits = raycaster.intersectObjects([...roots.values()], true)
      return hits[0]?.object.userData.objectId as string | undefined
    }
    const dragSelected = (clientX: number, clientY: number) => {
      const state = useSceneStore.getState(); const selected = state.objects.find((object) => object.id === state.selectedId); if (!selected) return
      const point = pointOnSurface(selected.placementType, clientX, clientY)
      if (point) state.updateObject(selected.id, { position: point.toArray() })
    }
    const pointerDown = (event: PointerEvent) => {
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); renderer.domElement.setPointerCapture(event.pointerId)
      if (activePointers.size === 2) {
        const [a, b] = [...activePointers.values()]; gestureStart = { distance: Math.hypot(a.x - b.x, a.y - b.y), angle: Math.atan2(b.y - a.y, b.x - a.x) }; return
      }
      const hitId = selectedAt(event.clientX, event.clientY)
      if (hitId) { useSceneStore.getState().selectObject(hitId); dragging = true }
      else { useSceneStore.getState().selectObject(null); place(event.clientX, event.clientY) }
    }
    const pointerMove = (event: PointerEvent) => {
      if (!activePointers.has(event.pointerId)) return
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      const selectedId = useSceneStore.getState().selectedId
      if (activePointers.size === 2 && selectedId && gestureStart) {
        const [a, b] = [...activePointers.values()]; const distance = Math.hypot(a.x - b.x, a.y - b.y); const angle = Math.atan2(b.y - a.y, b.x - a.x)
        useSceneStore.getState().scaleObject(selectedId, distance / gestureStart.distance)
        useSceneStore.getState().rotateObject(selectedId, angle - gestureStart.angle)
        gestureStart = { distance, angle }; return
      }
      if (dragging && selectedId) dragSelected(event.clientX, event.clientY)
    }
    const pointerUp = (event: PointerEvent) => { activePointers.delete(event.pointerId); if (activePointers.size < 2) gestureStart = null; if (!activePointers.size) dragging = false }
    renderer.domElement.addEventListener('pointerdown', pointerDown)
    renderer.domElement.addEventListener('pointermove', pointerMove)
    renderer.domElement.addEventListener('pointerup', pointerUp)
    renderer.domElement.addEventListener('pointercancel', pointerUp)

    const resize = () => { const width = host.clientWidth, height = host.clientHeight; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix() }
    const observer = new ResizeObserver(resize); observer.observe(host)

    const render = () => { renderer.render(scene, camera); frameHandle = requestAnimationFrame(render) }
    if (mode !== 'ar') render()
    else if (session) {
      session.addEventListener('end', onSessionEnd, { once: true })
      void renderer.xr.setSession(session).then(async () => {
        try { await hitTest.initialize(session); onStatus('Медленно перемещайте телефон, чтобы найти поверхность') } catch { onStatus('Hit-test недоступен — используйте ручную точку перед камерой') }
        renderer.setAnimationLoop((_time, frame) => { if (frame) hitTest.update(frame, reticle); renderer.render(scene, camera) })
      })
    }

    return () => {
      disposed = true; cancelAnimationFrame(frameHandle); renderer.setAnimationLoop(null); unsubscribe(); observer.disconnect(); hitTest.dispose()
      renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointermove', pointerMove); renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('pointercancel', pointerUp)
      for (const root of roots.values()) disposeObject(root)
      renderer.dispose(); renderer.domElement.remove(); canvasRef.current = null
    }
  }, [mode, session, onSessionEnd, onStatus])

  return <div ref={hostRef} className="scene-canvas" aria-label="Интерактивная 3D-сцена" />
})
