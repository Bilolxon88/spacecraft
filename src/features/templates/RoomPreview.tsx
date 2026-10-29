import { useState } from 'react'
import ProjectArt from '../projects/ProjectArt'
import { createProject } from './templates'

/** Preview renders of the shipped templates, never a promise about an edited project. */
export default function RoomPreview({ template }: { template: string }) {
  const [failed, setFailed] = useState(false)
  return !failed && ['living','bedroom','office','empty'].includes(template)
    ? <img className="rendered-room-preview" src={`/assets/rooms/${template}.png`} alt={`${template} template rendered in the SpaceCraft editor`} loading="lazy" onError={() => setFailed(true)} />
    : <ProjectArt project={createProject(template)} />
}
