import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Logo, ThemeToggle } from '../../components/ui'

const links = [['#possibilities', 'Possibilities'], ['#studio', 'The studio'], ['#templates', 'Templates'], ['#inspiration', 'Inspiration'], ['#how-it-works', 'How it works']]

export default function LandingNav() {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const nav = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus() }
    }
    const outside = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', close)
    window.addEventListener('pointerdown', outside)
    return () => { window.removeEventListener('keydown', close); window.removeEventListener('pointerdown', outside) }
  }, [open])
  return <nav ref={nav} className="landing-nav" aria-label="Main navigation">
    <Logo />
    <div className="nav-links">{links.map(([href, text]) => <a key={href} href={href}>{text}</a>)}</div>
    <div className="nav-actions">
      <ThemeToggle />
      <Link to="/dashboard" className="button secondary">Open workspace<ArrowUpRight size={15} /></Link>
      <button ref={toggle} className="mobile-nav-toggle icon-button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    {open && <div className="mobile-navigation" id="mobile-navigation">{links.map(([href, text], i) => <a key={href} href={href} onClick={() => setOpen(false)}><small>0{i + 1}</small>{text}<ArrowUpRight size={16} /></a>)}</div>}
  </nav>
}
