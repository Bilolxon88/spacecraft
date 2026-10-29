import { Armchair, Flower2, Layers, Lamp, SlidersHorizontal, HelpCircle, Save } from 'lucide-react'

export type StudioSection = 'furniture' | 'decor' | 'lighting' | 'scene' | 'room'
const sections = [
  { id: 'furniture', label: 'Furniture', icon: Armchair },
  { id: 'decor', label: 'Decor', icon: Flower2 },
  { id: 'lighting', label: 'Lighting', icon: Lamp },
  { id: 'scene', label: 'Objects', icon: Layers },
  { id: 'room', label: 'Room', icon: SlidersHorizontal },
] as const

export default function StudioRail({ active, onSelect, onHelp, onSave }: { active: StudioSection | null; onSelect: (section: StudioSection) => void; onHelp: () => void; onSave: () => void }) {
  return <nav className="studio-rail" aria-label="Studio tools">
    {sections.map(({ id, label, icon: Icon }) => <button key={id} aria-label={`Open ${label.toLowerCase()} panel`} aria-pressed={active === id} onClick={() => onSelect(id)}><Icon size={19} strokeWidth={1.5} /><span>{label}</span></button>)}
    <div className="rail-bottom"><button onClick={onHelp} aria-label="Studio help"><HelpCircle size={19} strokeWidth={1.5} /><span>Help</span></button><button onClick={onSave} aria-label="Save design"><Save size={19} strokeWidth={1.5} /><span>Save</span></button></div>
  </nav>
}
