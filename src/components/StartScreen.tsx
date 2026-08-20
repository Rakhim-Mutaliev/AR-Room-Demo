import type { DeviceSupport } from '../utils/deviceSupport'

type Props = {
  support: DeviceSupport | null
  busy: boolean
  error: string
  onStartAR: () => void
  onDemo: () => void
  onPhoto: (file: File) => void
}

export function StartScreen({ support, busy, error, onStartAR, onDemo, onPhoto }: Props) {
  const arAvailable = Boolean(support?.immersiveAR)
  return <main className="start-screen">
    <div className="start-noise" />
    <header className="brand"><span className="brand-mark">AR</span><span>ROOM / LAB</span><span className="prototype-tag">PROTOTYPE 01</span></header>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow"><span /> Пространственная примерка</p>
        <h1>Ваша комната.<br/><em>Новый взгляд.</em></h1>
        <p className="lead">Разместите мебель и материалы в реальном пространстве. Без регистрации, загрузки данных и лишних шагов.</p>
        {error && <p className="start-error" role="alert">{error}</p>}
        <div className="start-actions">
          <button className="primary-action" onClick={arAvailable ? onStartAR : onDemo} disabled={busy || !support?.webgl}>
            <span className="action-icon">⌗</span><span>{busy ? 'Запускаем…' : arAvailable ? 'Запустить AR' : 'Открыть деморежим'}<small>{arAvailable ? 'Камера и трекинг пространства' : 'WebXR не найден — 3D-комната'}</small></span><b>→</b>
          </button>
          {arAvailable && <button className="text-action" onClick={onDemo}>Демонстрационная комната <span>↗</span></button>}
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="room-frame">
          <div className="room-wall"><span className="window-shape"/><span className="picture-shape"/></div>
          <div className="room-floor" />
          <div className="sofa-shape"><i/><i/><i/></div>
          <div className="table-shape" />
          <div className="scan-line" />
          <div className="scan-label">SURFACE FOUND <b>●</b></div>
        </div>
        <span className="visual-caption">01 / LIVE SPACE</span>
      </div>
    </section>
    <section className="start-footer">
      <div className="support-state"><i className={arAvailable ? 'ok' : ''}/><span>{support ? arAvailable ? 'Полный AR-режим доступен' : 'Доступен демонстрационный режим' : 'Проверяем устройство…'}<small>Лучший опыт: Android · Chrome · ARCore · HTTPS</small></span></div>
      <label className="photo-upload">Использовать фотографию<input type="file" accept="image/*" capture="environment" onChange={(event) => event.target.files?.[0] && onPhoto(event.target.files[0])}/><span>＋</span></label>
      <p>Кадры обрабатываются только на устройстве</p>
    </section>
  </main>
}
