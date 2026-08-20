export const requestARSession = async () => {
  if (!navigator.xr) throw new Error('WebXR недоступен')
  return navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['dom-overlay', 'anchors', 'light-estimation'],
    domOverlay: { root: document.body },
  })
}

export const endARSession = async (session: XRSession | null) => {
  if (session) await session.end()
}
