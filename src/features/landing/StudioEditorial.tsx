import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Box, Move3D, Palette, Footprints } from 'lucide-react'
import RoomPreview from '../templates/RoomPreview'
import { Reveal, RevealHeading } from './motion'

export function StudioEditorial() {
  return <section id="studio" className="landing-section studio-editorial">
    <div className="studio-editorial-copy"><span className="eyebrow">THE SPACECRAFT STUDIO</span>
      <RevealHeading lines={['Consider every angle.', 'Make every detail yours.']} />
      <p>A quiet workspace for bold ideas. Place a piece, tune its proportions, choose a finish, then step inside the room you created.</p>
      <Link className="button primary" to="/projects/new?template=living">Explore the studio<ArrowUpRight size={16} /></Link>
      <div className="studio-capabilities"><span><Move3D size={15} />Precise placement</span><span><Palette size={15} />Material controls</span><span><Footprints size={15} />First-person exploration</span></div>
    </div>
    <Reveal className="studio-editorial-visual">
      <div className="studio-preview-bar"><span><Box size={16} />SpaceCraft studio</span><small>SCANDINAVIAN LIVING</small></div>
      <Link to="/projects/new?template=living" className="studio-preview-link" aria-label="Open the living room in the editor">
        <RoomPreview template="living" />
        <span className="preview-entry">A room you can make your own<ArrowUpRight size={18} /></span>
      </Link>
      <p className="preview-caption">Rendered in SpaceCraft · Open this template to arrange and explore it.</p>
    </Reveal>
  </section>
}

const inspirations = [
  { id: 'living', filter: 'Living', title: 'The art of slowing down.', description: 'Natural textures, softened edges, space to breathe.' },
  { id: 'bedroom', filter: 'Rest', title: 'A quieter kind of luxury.', description: 'A considered starting point for your evening retreat.' },
  { id: 'office', filter: 'Work', title: 'Clarity begins with space.', description: 'A focused room with a little room to think.' },
]

export function InspirationEditorial() {
  const [filter, setFilter] = useState('All spaces')
  const items = inspirations.filter(item => filter === 'All spaces' || item.filter === filter)
  return <section id="inspiration" className="landing-section inspiration-editorial">
    <div className="section-heading"><div><span className="eyebrow">A DIFFERENT WAY TO SEE HOME</span><RevealHeading lines={['Beautiful spaces.', 'Your point of departure.']} /></div>
      <div className="inspiration-filters" aria-label="Inspiration categories">{['All spaces', 'Living', 'Rest', 'Work'].map(name => <button key={name} aria-pressed={filter === name} onClick={() => setFilter(name)}>{name}</button>)}</div>
    </div>
    <div className={`inspiration-layout ${items.length === 1 ? 'single' : ''}`}>{items.map((item, index) => <Link key={item.id} to={`/projects/new?template=${item.id}`} className="inspiration-item">
      <div className="inspiration-image"><RoomPreview template={item.id} /><span>0{index + 1} / {item.filter}</span></div>
      <div className="inspiration-caption"><div><h3>{item.title}</h3><p>{item.description}</p></div><ArrowUpRight size={22} /></div>
    </Link>)}</div>
  </section>
}
