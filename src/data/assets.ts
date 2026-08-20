import type { ARAsset, AssetCategory } from '../types/assets'

export const assets: ARAsset[] = [
  { id: 'sofa', name: 'Мягкий диван', shortName: 'Диван', category: 'furniture', placementType: 'floor', modelUrl: '/models/sofa.glb', color: '#c8aa83', defaultScale: 1, minimumScale: .55, maximumScale: 1.7, realSize: { width: 2.1, height: .82, depth: .88 } },
  { id: 'armchair', name: 'Кресло', shortName: 'Кресло', category: 'furniture', placementType: 'floor', modelUrl: '/models/armchair.glb', color: '#9e684d', defaultScale: 1, minimumScale: .55, maximumScale: 1.7, realSize: { width: .86, height: .9, depth: .86 } },
  { id: 'table', name: 'Журнальный стол', shortName: 'Стол', category: 'furniture', placementType: 'floor', modelUrl: '/models/table.glb', color: '#9f7650', defaultScale: 1, minimumScale: .55, maximumScale: 1.8, realSize: { width: 1.15, height: .43, depth: .62 } },
  { id: 'tv', name: 'Настенный телевизор', shortName: 'ТВ', category: 'wall', placementType: 'wall', modelUrl: '/models/tv.glb', color: '#343633', defaultScale: 1, minimumScale: .55, maximumScale: 1.7, realSize: { width: 1.25, height: .72, depth: .08 } },
  { id: 'window', name: 'Панорамное окно', shortName: 'Окно', category: 'wall', placementType: 'wall', modelUrl: '/models/window.glb', color: '#9fc7cf', defaultScale: 1, minimumScale: .55, maximumScale: 1.8, realSize: { width: 1.4, height: 1.2, depth: .07 } },
  { id: 'lamp', name: 'Подвесная люстра', shortName: 'Люстра', category: 'ceiling', placementType: 'ceiling', modelUrl: '/models/lamp.glb', color: '#e1c17c', defaultScale: 1, minimumScale: .55, maximumScale: 1.7, realSize: { width: .62, height: .72, depth: .62 } },
  { id: 'wallpaper-light', name: 'Льняные обои', shortName: 'Обои', category: 'material', placementType: 'surface-wall', textureUrl: '/textures/wallpaper-light.svg', color: '#d9d0bd', defaultScale: 1, minimumScale: .5, maximumScale: 3, realSize: { width: 2.2, height: 1.5, depth: .01 } },
  { id: 'wallpaper-dark', name: 'Графитовые обои', shortName: 'Графит', category: 'material', placementType: 'surface-wall', textureUrl: '/textures/wallpaper-dark.svg', color: '#555852', defaultScale: 1, minimumScale: .5, maximumScale: 3, realSize: { width: 2.2, height: 1.5, depth: .01 } },
  { id: 'floor-light', name: 'Светлый дуб', shortName: 'Дуб', category: 'material', placementType: 'surface-floor', textureUrl: '/textures/floor-light.svg', color: '#c49a6c', defaultScale: 1, minimumScale: .5, maximumScale: 3, realSize: { width: 2.4, height: .01, depth: 2.1 } },
  { id: 'floor-dark', name: 'Тёмный дуб', shortName: 'Орех', category: 'material', placementType: 'surface-floor', textureUrl: '/textures/floor-dark.svg', color: '#674733', defaultScale: 1, minimumScale: .5, maximumScale: 3, realSize: { width: 2.4, height: .01, depth: 2.1 } },
]

export const categories: { id: AssetCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'furniture', label: 'Мебель' },
  { id: 'wall', label: 'Стена' },
  { id: 'ceiling', label: 'Потолок' },
  { id: 'material', label: 'Материалы' },
]

export const getAsset = (id: string) => assets.find((asset) => asset.id === id)
