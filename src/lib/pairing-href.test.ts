import { describe, expect, it } from 'vitest'
import { pairingHint, pairingHref } from './pairing-href'

describe('pairingHref', () => {
  it('uses the /receive and /receive/:code shape', () => {
    expect(pairingHref(null, 'https://clipcam.app')).toBe('https://clipcam.app/receive')
    expect(pairingHref('AB3K9Q', 'https://clipcam.app')).toBe(
      'https://clipcam.app/receive/AB3K9Q',
    )
  })
})

describe('pairingHint', () => {
  it('prints the current host path', () => {
    expect(pairingHint('clipcam.app')).toBe('clipcam.app/receive')
  })
})
