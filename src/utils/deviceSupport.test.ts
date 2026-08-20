import { describe, expect, it } from 'vitest'
import { isAllowedPlacement } from './deviceSupport'

describe('isAllowedPlacement', () => {
  it('разрешает объект только на подходящей поверхности', () => {
    expect(isAllowedPlacement('floor', 'floor')).toBe(true)
    expect(isAllowedPlacement('surface-wall', 'wall')).toBe(true)
    expect(isAllowedPlacement('wall', 'floor')).toBe(false)
    expect(isAllowedPlacement('ceiling', 'wall')).toBe(false)
  })
})
