import { useState } from 'react'
import { assets, categories } from '../data/assets'
import { useSceneStore } from '../store/sceneStore'
import type { AssetCategory } from '../types/assets'

const glyph: Record<string, string> = { sofa: '▰', armchair: '▣', table: '⌑', tv: '▭', window: '▦', lamp: '♢', 'wallpaper-light': '▥', 'wallpaper-dark': '▥', 'floor-light': '▤', 'floor-dark': '▤' }
const surfaceLabel = (placement: string) => placement.includes('wall') ? 'Стена' : placement.includes('ceiling') ? 'Потолок' : 'Пол'

export function AssetPicker() {
  const [category, setCategory] = useState<AssetCategory | 'all'>('all')
  const pending = useSceneStore((state) => state.pendingAssetId)
  const setPending = useSceneStore((state) => state.setPendingAsset)
  const close = useSceneStore((state) => state.setPickerOpen)
  const visible = category === 'all' ? assets : assets.filter((asset) => asset.category === category)
  return <div className="sheet-backdrop" onPointerDown={(event) => { if (event.target === event.currentTarget) close(false) }}>
    <section className="asset-sheet" aria-label="Выбор элемента">
      <button className="sheet-grip" aria-label="Закрыть" onClick={() => close(false)} />
      <header><div><p>Библиотека</p><h2>Выберите элемент</h2></div><button onClick={() => close(false)} aria-label="Закрыть">×</button></header>
      <nav>{categories.map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}>{item.label}</button>)}</nav>
      <div className="asset-grid">{visible.map((asset) => <button className={`asset-card ${pending === asset.id ? 'selected' : ''}`} key={asset.id} onClick={() => setPending(asset.id)}>
        <span className="asset-thumb" style={{ '--asset-color': asset.color } as React.CSSProperties}><b>{glyph[asset.id]}</b><i>{surfaceLabel(asset.placementType)}</i></span>
        <strong>{asset.shortName}</strong><small>{asset.name}</small>
      </button>)}</div>
    </section>
  </div>
}
