type Props = { mode: 'demo' | 'photo' | 'ar'; onExit: () => void; onCapture: () => void; onReset: () => void; onOpenPicker: () => void }

export function ARToolbar({ mode, onExit, onCapture, onReset, onOpenPicker }: Props) {
  return <>
    <header className="workspace-header"><button onClick={onExit} aria-label="Выйти">←</button><span><b>AR ROOM</b><small>{mode === 'ar' ? 'LIVE' : mode === 'photo' ? 'PHOTO' : 'DEMO'}</small></span><button onClick={onReset} aria-label="Сбросить сцену">↺</button></header>
    <div className="workspace-toolbar">
      <button onClick={onOpenPicker}><span>＋</span><small>Добавить</small></button>
      <button onClick={onCapture}><span>◎</span><small>Снимок</small></button>
    </div>
  </>
}
