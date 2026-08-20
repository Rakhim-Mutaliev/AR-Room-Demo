import { useCallback, useEffect, useState } from 'react'
import { requestARSession } from '../ar/ARSession'
import { StartScreen } from '../components/StartScreen'
import { Workspace } from '../components/Workspace'
import { useSceneStore } from '../store/sceneStore'
import { detectDeviceSupport, type DeviceSupport } from '../utils/deviceSupport'

type ActiveMode = 'start' | 'demo' | 'photo' | 'ar'

export default function App() {
  const [support, setSupport] = useState<DeviceSupport | null>(null)
  const [mode, setMode] = useState<ActiveMode>('start')
  const [session, setSession] = useState<XRSession | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const clearScene = useSceneStore((state) => state.clearScene)
  useEffect(() => { void detectDeviceSupport().then(setSupport) }, [])
  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl) }, [photoUrl])

  const startAR = async () => {
    setBusy(true); setError('')
    try { const nextSession = await requestARSession(); setSession(nextSession); setMode('ar') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Не удалось запустить AR'); setMode('start') }
    finally { setBusy(false) }
  }
  const openPhoto = (file: File) => { if (photoUrl) URL.revokeObjectURL(photoUrl); setPhotoUrl(URL.createObjectURL(file)); setMode('photo') }
  const exit = useCallback(() => { setSession(null); setMode('start'); clearScene() }, [clearScene])
  if (mode === 'start') return <StartScreen support={support} busy={busy} error={error} onStartAR={() => void startAR()} onDemo={() => setMode('demo')} onPhoto={openPhoto}/>
  return <Workspace mode={mode} backgroundUrl={mode === 'photo' ? photoUrl : undefined} session={session} onExit={exit}/>
}
