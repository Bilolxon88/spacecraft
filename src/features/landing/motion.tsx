import { createElement,useEffect,useRef } from 'react'
import type { ReactNode,RefObject } from 'react'
import { motion,useAnimate,useInView,useReducedMotion,useScroll,useSpring,useTransform } from 'motion/react'
import './motion.css'

const ease=[.22,.68,0,1] as const

// Nothing is hidden in markup or CSS. Start animations only after an element is visible;
// missing observers, reduced motion, interruption, or an animation failure all leave readable content.
export function Reveal({children,className,delay=0,as='div'}:{children:ReactNode;className?:string;delay?:number;as?:'div'|'section'|'article'|'footer'}){
 const [scope,animate]=useAnimate<HTMLElement>()
 const visible=useInView(scope,{once:true,amount:.08})
 const reduced=useReducedMotion()
 useEffect(()=>{if(!visible||reduced)return;let active=true;const element=scope.current;let controls:ReturnType<typeof animate>|undefined;const reset=()=>{if(element){element.style.removeProperty('opacity');element.style.removeProperty('transform')}};try{controls=animate(element,{opacity:[.2,1],y:[18,0]},{duration:.65,delay:Math.min(delay,.24),ease});void controls.then(()=>{if(active)reset()}).catch(reset)}catch{reset()}return()=>{active=false;controls?.stop();reset()}},[visible,reduced,animate,scope,delay])
 return createElement(as,{ref:scope,className},children)
}

export function RevealHeading({lines,as='h2'}:{lines:ReactNode[];as?:'h1'|'h2'}){
 const [scope,animate]=useAnimate<HTMLHeadingElement>()
 const visible=useInView(scope,{once:true,amount:.2})
 const reduced=useReducedMotion()
 useEffect(()=>{if(!visible||reduced)return;const elements=Array.from(scope.current.querySelectorAll<HTMLElement>('.heading-line'));const reset=()=>elements.forEach(el=>{el.style.removeProperty('transform');el.style.removeProperty('opacity')});const controls=elements.map((el,i)=>animate(el,{y:['35%','0%'],opacity:[.2,1]},{duration:.75,delay:i*.075,ease}));void Promise.all(controls).then(reset).catch(reset);return()=>{controls.forEach(c=>c.stop());reset()}},[visible,reduced,animate,scope])
 return createElement(as,{ref:scope},lines.map((line,i)=><span className="heading-mask" key={i}><span className="heading-line">{line}{i<lines.length-1?' ':''}</span></span>))
}

export function Parallax({children,className}:{children:ReactNode;className?:string}){
 const ref=useRef<HTMLDivElement>(null)
 const reduced=useReducedMotion()
 const {scrollYProgress}=useScroll({target:ref,offset:['start end','end start']})
 const travel=useTransform(scrollYProgress,[0,1],[10,-10])
 const y=useSpring(travel,{stiffness:110,damping:32,mass:.3})
 return <motion.div ref={ref} className={className} style={{y:reduced?0:y}}>{children}</motion.div>
}

export function useLandingMotion(target:RefObject<HTMLElement|null>){
 const reduced=useReducedMotion()
 const {scrollYProgress}=useScroll({target,offset:['start start','end start']})
 const progress=useSpring(scrollYProgress,{stiffness:90,damping:30,mass:.35})
 useEffect(()=>{const root=document.documentElement;if(!reduced)root.classList.add('landing-smooth-scroll');return()=>root.classList.remove('landing-smooth-scroll')},[reduced])
 return reduced?undefined:progress
}
