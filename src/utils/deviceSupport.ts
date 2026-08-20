export type DeviceSupport = { webgl: boolean; camera: boolean; webxr: boolean; immersiveAR: boolean }

export const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch { return false }
}

export const detectDeviceSupport = async (): Promise<DeviceSupport> => {
  const webxr = Boolean(navigator.xr)
  let immersiveAR = false
  if (webxr) {
    try { immersiveAR = await navigator.xr!.isSessionSupported('immersive-ar') } catch { immersiveAR = false }
  }
  return { webgl: hasWebGL(), camera: Boolean(navigator.mediaDevices?.getUserMedia), webxr, immersiveAR }
}

export const isAllowedPlacement = (assetType: string, surface: 'floor' | 'wall' | 'ceiling') =>
  assetType === surface || assetType === `surface-${surface}`
