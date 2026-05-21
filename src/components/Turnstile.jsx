import { useEffect, useRef } from 'react'

// Cloudflare Turnstile Site Key
// Test key (always passes): 1x00000000000000000000AA
// Thay bằng key thật từ: https://dash.cloudflare.com → Turnstile
const TURNSTILE_SITE_KEY = '0x4AAAAAABfMQy5WJy22V3oR'

export default function Turnstile({ onVerify, onExpire }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) return

      // Clear previous widget
      if (widgetIdRef.current !== null) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        callback: (token) => onVerify?.(token),
        'expired-callback': () => onExpire?.(),
        'error-callback': () => onExpire?.(),
      })
    }

    // Wait for turnstile script to load
    if (window.turnstile) {
      renderWidget()
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval)
          renderWidget()
        }
      }, 100)
      return () => clearInterval(interval)
    }

    return () => {
      if (widgetIdRef.current !== null) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
      }
    }
  }, [])

  return <div ref={containerRef} className="cf-turnstile" />
}
