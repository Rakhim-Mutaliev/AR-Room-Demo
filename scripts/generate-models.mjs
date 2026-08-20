import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const output = join(process.cwd(), 'public', 'models')
mkdirSync(output, { recursive: true })

const positions = new Float32Array([
  -.5,-.5,.5, .5,-.5,.5, .5,.5,.5, -.5,.5,.5,
  .5,-.5,-.5, -.5,-.5,-.5, -.5,.5,-.5, .5,.5,-.5,
  -.5,.5,.5, .5,.5,.5, .5,.5,-.5, -.5,.5,-.5,
  -.5,-.5,-.5, .5,-.5,-.5, .5,-.5,.5, -.5,-.5,.5,
  .5,-.5,.5, .5,-.5,-.5, .5,.5,-.5, .5,.5,.5,
  -.5,-.5,-.5, -.5,-.5,.5, -.5,.5,.5, -.5,.5,-.5,
])
const normals = new Float32Array([
  0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
  0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
  1,0,0, 1,0,0, 1,0,0, 1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0,
])
const indices = new Uint16Array([
  0,1,2,0,2,3, 4,5,6,4,6,7, 8,9,10,8,10,11,
  12,13,14,12,14,15, 16,17,18,16,18,19, 20,21,22,20,22,23,
])

const palette = {
  fabric: [0.57, 0.37, 0.25, 1], lightFabric: [0.72, 0.58, 0.43, 1],
  wood: [0.35, 0.2, 0.1, 1], dark: [0.035, 0.04, 0.038, 1],
  metal: [0.24, 0.25, 0.22, 1], glass: [0.35, 0.67, 0.75, .45], gold: [.78, .58, .2, 1], white: [.78, .76, .7, 1],
}

const box = (name, translation, scale, material, rotation) => ({ name, translation, scale, material, rotation })
const models = {
  sofa: [
    box('seat', [0,.34,0], [2.1,.34,.84], 'lightFabric'), box('back', [0,.72,.35], [2.1,.68,.18], 'fabric'),
    box('left-arm', [-.96,.61,0], [.18,.55,.82], 'fabric'), box('right-arm', [.96,.61,0], [.18,.55,.82], 'fabric'),
    box('leg-1', [-.78,.1,-.27], [.1,.2,.1], 'wood'), box('leg-2', [.78,.1,-.27], [.1,.2,.1], 'wood'),
    box('leg-3', [-.78,.1,.27], [.1,.2,.1], 'wood'), box('leg-4', [.78,.1,.27], [.1,.2,.1], 'wood'),
  ],
  armchair: [
    box('seat', [0,.35,0], [.86,.35,.8], 'fabric'), box('back', [0,.76,.31], [.86,.7,.18], 'fabric'),
    box('left-arm', [-.38,.6,0], [.14,.54,.76], 'lightFabric'), box('right-arm', [.38,.6,0], [.14,.54,.76], 'lightFabric'),
    box('feet', [0,.1,0], [.6,.2,.55], 'wood'),
  ],
  table: [
    box('top', [0,.4,0], [1.15,.08,.62], 'wood'), box('leg-1', [-.46,.2,-.21], [.09,.4,.09], 'metal'),
    box('leg-2', [.46,.2,-.21], [.09,.4,.09], 'metal'), box('leg-3', [-.46,.2,.21], [.09,.4,.09], 'metal'), box('leg-4', [.46,.2,.21], [.09,.4,.09], 'metal'),
  ],
  tv: [
    box('screen', [0,0,.035], [1.25,.72,.07], 'dark'), box('display', [0,0,.073], [1.16,.63,.008], 'glass'), box('mount', [0,0,-.025], [.34,.28,.05], 'metal'),
  ],
  window: [
    box('glass', [0,0,.015], [1.3,1.1,.03], 'glass'), box('top', [0,.57,.04], [1.4,.07,.07], 'white'), box('bottom', [0,-.57,.04], [1.4,.07,.07], 'white'),
    box('left', [-.665,0,.04], [.07,1.2,.07], 'white'), box('right', [.665,0,.04], [.07,1.2,.07], 'white'), box('center', [0,0,.04], [.055,1.1,.055], 'white'),
  ],
  lamp: [
    box('mount', [0,-.04,0], [.34,.08,.34], 'metal'), box('cable', [0,-.3,0], [.035,.55,.035], 'dark'),
    box('shade', [0,-.61,0], [.62,.2,.62], 'gold'), box('light', [0,-.74,0], [.25,.12,.25], 'white'),
  ],
}

function makeGlb(name, parts) {
  const positionBytes = Buffer.from(positions.buffer)
  const normalBytes = Buffer.from(normals.buffer)
  const indexBytes = Buffer.from(indices.buffer)
  const bin = Buffer.concat([positionBytes, normalBytes, indexBytes, Buffer.alloc((4 - indexBytes.length % 4) % 4)])
  const materialNames = [...new Set(parts.map((part) => part.material))]
  const gltf = {
    asset: { version: '2.0', generator: 'AR Room Demo procedural generator' },
    scene: 0, scenes: [{ nodes: parts.map((_, index) => index) }],
    nodes: parts.map((part, index) => ({ name: part.name, mesh: materialNames.indexOf(part.material), translation: part.translation, scale: part.scale, ...(part.rotation ? { rotation: part.rotation } : {}) })),
    meshes: materialNames.map((material, index) => ({ name: material, primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: index }] })),
    materials: materialNames.map((material) => ({ name: material, pbrMetallicRoughness: { baseColorFactor: palette[material], metallicFactor: material === 'metal' ? .7 : .05, roughnessFactor: material === 'glass' ? .18 : .72 }, ...(material === 'glass' ? { alphaMode: 'BLEND', doubleSided: true } : {}) })),
    buffers: [{ byteLength: bin.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positionBytes.length, target: 34962 },
      { buffer: 0, byteOffset: positionBytes.length, byteLength: normalBytes.length, target: 34962 },
      { buffer: 0, byteOffset: positionBytes.length + normalBytes.length, byteLength: indexBytes.length, target: 34963 },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 24, type: 'VEC3', min: [-.5,-.5,-.5], max: [.5,.5,.5] },
      { bufferView: 1, componentType: 5126, count: 24, type: 'VEC3' },
      { bufferView: 2, componentType: 5123, count: 36, type: 'SCALAR' },
    ],
  }
  let json = Buffer.from(JSON.stringify(gltf))
  json = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 0x20)])
  const header = Buffer.alloc(12); header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8)
  const jsonHeader = Buffer.alloc(8); jsonHeader.writeUInt32LE(json.length, 0); jsonHeader.writeUInt32LE(0x4e4f534a, 4)
  const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(bin.length, 0); binHeader.writeUInt32LE(0x004e4942, 4)
  writeFileSync(join(output, `${name}.glb`), Buffer.concat([header, jsonHeader, json, binHeader, bin]))
}

for (const [name, parts] of Object.entries(models)) makeGlb(name, parts)
console.log(`Generated ${Object.keys(models).length} GLB models in ${output}`)
