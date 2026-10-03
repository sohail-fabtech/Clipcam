import type { Handle } from 'remix/component'

interface BrandMarkProps {
  size?: number
  className?: string
  /**
   * Home LCP art. Renders a same-size spacer; the visible image lives in
   * index.html `#boot-hero` so first paint is not gated on the SPA bundle.
   */
  priority?: boolean
}

/** The Clipcam pass mark (public/logo.svg — the source for every icon). */
export function BrandMark(handle: Handle<BrandMarkProps>) {
  return () => {
    const { size = 56, className, priority = false } = handle.props

    if (priority) {
      return (
        <div
          className={className}
          style={{ width: size, height: size }}
          aria-hidden="true"
        />
      )
    }

    return (
      <img
        className={className}
        width={size}
        height={size}
        src="/logo.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
      />
    )
  }
}
