import { beforeEach, describe, expect, it } from 'vitest'
import { clampScale, useSceneStore } from './sceneStore'

describe('sceneStore', () => {
  beforeEach(() => useSceneStore.setState({ objects: [], selectedId: null, pendingAssetId: 'sofa', pickerOpen: false }))

  it('ограничивает масштаб диапазоном модели', () => {
    expect(clampScale(.2, .5, 2)).toBe(.5)
    expect(clampScale(3, .5, 2)).toBe(2)
    expect(clampScale(1.2, .5, 2)).toBe(1.2)
  })

  it('добавляет, заменяет и удаляет объект', () => {
    const store = useSceneStore.getState()
    const id = store.addObject('sofa', { position: [1, 0, -2] })
    expect(useSceneStore.getState().objects[0].assetId).toBe('sofa')
    useSceneStore.getState().replaceObject(id, 'armchair')
    expect(useSceneStore.getState().objects[0].assetId).toBe('armchair')
    useSceneStore.getState().removeObject(id)
    expect(useSceneStore.getState().objects).toHaveLength(0)
  })

  it('дублирует объект, не удаляя исходный', () => {
    const id = useSceneStore.getState().addObject('table', { position: [0, 0, -2] })
    useSceneStore.getState().duplicateObject(id)
    expect(useSceneStore.getState().objects).toHaveLength(2)
    expect(useSceneStore.getState().objects[1].position).not.toEqual(useSceneStore.getState().objects[0].position)
  })

  it('очищает всю сцену', () => {
    useSceneStore.getState().addObject('sofa', {})
    useSceneStore.getState().addObject('table', {})
    useSceneStore.getState().clearScene()
    expect(useSceneStore.getState().objects).toEqual([])
    expect(useSceneStore.getState().selectedId).toBeNull()
  })
})
