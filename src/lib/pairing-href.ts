/** Canonical receive URL for Send to device: /receive and /receive/:code. */
export function pairingHref(
  code?: string | null,
  origin: string = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  const base = `${origin}/receive`
  return code ? `${base}/${code}` : base
}

/** Spoken/printed host path for the receive page on this deployment. */
export function pairingHint(
  host: string = typeof window !== 'undefined' ? window.location.host : '',
): string {
  return `${host}/receive`
}
