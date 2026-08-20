import * as THREE from 'three'

export class HitTestManager {
  private source: XRHitTestSource | null = null
  private referenceSpace: XRReferenceSpace | null = null

  async initialize(session: XRSession) {
    const viewer = await session.requestReferenceSpace('viewer')
    this.referenceSpace = await session.requestReferenceSpace('local')
    if (!session.requestHitTestSource) throw new Error('Hit-test API недоступен')
    this.source = await session.requestHitTestSource({ space: viewer }) ?? null
  }

  update(frame: XRFrame, target: THREE.Object3D) {
    if (!this.source || !this.referenceSpace) return false
    const result = frame.getHitTestResults(this.source)[0]
    if (!result) { target.visible = false; return false }
    const pose = result.getPose(this.referenceSpace)
    if (!pose) return false
    target.visible = true
    target.matrix.fromArray(pose.transform.matrix)
    return true
  }

  dispose() { this.source?.cancel(); this.source = null; this.referenceSpace = null }
}
