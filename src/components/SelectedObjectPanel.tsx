import { assets, getAsset } from '../data/assets'
import { useSceneStore } from '../store/sceneStore'

export function SelectedObjectPanel() {
  const selectedId = useSceneStore((state) => state.selectedId)
  const object = useSceneStore((state) => state.objects.find((item) => item.id === selectedId))
  const rotate = useSceneStore((state) => state.rotateObject)
  const scale = useSceneStore((state) => state.scaleObject)
  const remove = useSceneStore((state) => state.removeObject)
  const duplicate = useSceneStore((state) => state.duplicateObject)
  const replace = useSceneStore((state) => state.replaceObject)
  const select = useSceneStore((state) => state.selectObject)
  if (!object) return null
  const asset = getAsset(object.assetId)!
  const variants = assets.filter((item) => item.category === asset.category && item.id !== asset.id)
  const next = variants[0]
  return <section className="selection-panel">
    <div className="selection-name"><i style={{ background: asset.color }}/><span><strong>{asset.shortName}</strong><small>Масштаб {Math.round(object.scale * 100)}%</small></span></div>
    <div className="selection-actions">
      <button onClick={() => scale(object.id, .9)} aria-label="Уменьшить">−</button>
      <button onClick={() => scale(object.id, 1.1)} aria-label="Увеличить">＋</button>
      <button onClick={() => rotate(object.id, Math.PI / 12)} aria-label="Повернуть">↻</button>
      <button onClick={() => duplicate(object.id)} aria-label="Дублировать">⧉</button>
      {next && <button onClick={() => replace(object.id, next.id)} aria-label={`Заменить на ${next.name}`}>⇄</button>}
      <button className="danger" onClick={() => remove(object.id)} aria-label="Удалить">⌫</button>
      <button onClick={() => select(null)} aria-label="Закрыть">×</button>
    </div>
  </section>
}
