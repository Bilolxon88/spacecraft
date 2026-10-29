import { lazy, Suspense, useCallback, useRef, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { Link } from 'react-router-dom'
import type { Project } from '../../types/project'
import ProjectArt from '../projects/ProjectArt'
import './journey.css'

const JourneyScene = lazy(() => import('./JourneyScene'))
const motionQuery = '(prefers-reduced-motion: reduce)'
const subscribeToMotionPreference = (changed: () => void) => {
  const query = window.matchMedia(motionQuery)
  query.addEventListener('change', changed)
  return () => query.removeEventListener('change', changed)
}
const motionSnapshot = () => window.matchMedia(motionQuery).matches

export default function RoomJourney({ project, children }: { project: Project; children: ReactNode }) {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, motionSnapshot, () => true)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const onFailure = useCallback(() => setFailed(true), [])
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: .3, restDelta: .00005 })
  const copyOpacity = useTransform(progress, [0, .07, .2], [1, 1, 0])
  const copyVisibility = useTransform(progress, value => value > .2 ? 'hidden' : 'visible')
  const frame = useTransform(progress, [0, .25], ['inset(10% 0% 10% 46% round 11px)', 'inset(0% 0% 0% 0% round 0px)'])
  const overviewOpacity = useTransform(progress, [0, .15, .28], [1, 1, 0])
  const interiorOpacity = useTransform(progress, [.65, .8, 1], [0, 1, 1])
  const interiorVisibility = useTransform(progress, value => value > .65 ? 'visible' : 'hidden')
  const fallback = <div className="journey-fallback"><ProjectArt project={project} /><p>{failed ? '3D is unavailable in this browser. Explore the room templates below.' : 'Preparing your 3D room…'}</p></div>

  return <section ref={section} className={`room-journey ${reducedMotion ? 'journey-reduced' : ''} ${failed ? 'journey-failed' : ''}`} aria-label="A journey into your room">
    <div className="journey-sticky">
      <motion.div ref={stage} className="journey-stage" style={{ clipPath: reducedMotion || failed ? undefined : frame }}>
        {failed ? fallback : <Suspense fallback={fallback}><JourneyScene progress={progress} reducedMotion={reducedMotion} stage={stage} onFailure={onFailure} onReady={onReady} /></Suspense>}
        {!failed && !ready && <div className="journey-loading" role="status">Preparing furniture and materials…</div>}
      </motion.div>
      <motion.div className="journey-shade" style={{ opacity: reducedMotion || failed ? 1 : overviewOpacity }} />
      <motion.div className="journey-copy" style={{ opacity: reducedMotion || failed ? 1 : copyOpacity, visibility: reducedMotion || failed ? 'visible' : copyVisibility }}>{children}</motion.div>
      <motion.div className="journey-overview" style={{ opacity: reducedMotion || failed ? 1 : overviewOpacity }}><span className="status-dot green" />SCANDINAVIAN LIVING · 25 m²</motion.div>
      <a className="journey-credits" href="/assets/showcase/credits.html" target="_blank" rel="noreferrer">3D asset credits</a>
      {!reducedMotion && !failed && <>
        <div className="journey-scroll-hint"><ArrowDown size={14} /><span>Scroll to step inside</span><motion.span className="journey-progress" style={{ scaleX: progress }} /></div>
        <motion.div className="journey-interior" style={{ opacity: interiorOpacity, visibility: interiorVisibility }}><span>YOUR ROOM. A NEW PERSPECTIVE.</span><Link className="button secondary" to="/projects/new?template=living">Make this space yours<ArrowUpRight size={15} /></Link></motion.div>
        <a href="#possibilities" className="journey-skip">Skip room tour<ArrowDown size={11} /></a>
      </>}
    </div>
  </section>
}
