import { useCallback, useRef, useState } from 'react'
import { getAsset } from '../data/assets'
import { endARSession } from '../ar/ARSession'
import { SceneCanvas, type SceneCanvasHandle } from '../renderer/SceneCanvas'
import { useSceneStore } from '../store/sceneStore'
import { ARToolbar } from './ARToolbar'
import { AssetPicker } from './AssetPicker'
import { SelectedObjectPanel } from './SelectedObjectPanel'

type Props = { mode: 'demo' | 'photo' | 'ar'; backgroundUrl?: string; session?: XRSession | null; onExit: () => void }

export function Workspace({ mode, backgroundUrl, session = null, onExit }: Props) {
  const sceneRef = useRef<SceneCanvasHandle>(null)
  const [status, setStatus] = useState(mode === 'ar' ? 'Ищем поверхность…' : 'Выберите элемент и коснитесь поверхности')
  const pickerOpen = useSceneStore((state) => state.pickerOpen)
  const pendingAssetId = useSceneStore((state) => state.pendingAssetId)
  const objects = useSceneStore((state) => state.objects)
  const selectedId = useSceneStore((state) => state.selectedId)
  const setPickerOpen = useSceneStore((state) => state.setPickerOpen)
  const clearScene = useSceneStore((state) => state.clearScene)
  const asset = getAsset(pendingAssetId)!
  const stableStatus = useCallback((message: string) => setStatus(message), [])
  const handleSessionEnd = useCallback(() => onExit(), [onExit])
  const exit = async () => { await endARSession(session); onExit() }
  const reset = () => { if (!objects.length || window.confirm('Удалить все размещённые элементы?')) clearScene() }
  const capture = async () => {
    try {
      const blob = await sceneRef.current!.capture()
      const file = new File([blob], 'ar-room.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'AR Room Demo' })
      else { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Снимок недоступен в этом браузере') }
  }
  return <main className={`workspace mode-${mode}`} style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined}>
    <SceneCanvas ref={sceneRef} mode={mode} backgroundUrl={backgroundUrl} session={session} onStatus={stableStatus} onSessionEnd={handleSessionEnd}/>
    <ARToolbar mode={mode} onExit={() => void exit()} onCapture={() => void capture()} onReset={reset} onOpenPicker={() => setPickerOpen(true)}/>
    {!selectedId && <div className="crosshair"><i/><span/></div>}
    <div className="status-pill"><i className={mode === 'ar' ? 'pulse' : ''}/><span>{status}<small>{asset.shortName} · {asset.placementType.includes('wall') ? 'стена' : asset.placementType.includes('ceiling') ? 'потолок' : 'пол'}</small></span></div>
    <SelectedObjectPanel />
    {pickerOpen && <AssetPicker />}
  </main>
}
