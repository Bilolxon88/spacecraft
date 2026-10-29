import { lazy,Suspense,useEffect } from 'react'
import { BrowserRouter,Link,Route,Routes,useLocation } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { Box } from 'lucide-react'
import { loadPreferences,usePreferences } from '../stores/preferences'
const Landing=lazy(()=>import('../pages/Landing'))
const Dashboard=lazy(()=>import('../pages/Dashboard'))
const NewProject=lazy(()=>import('../pages/NewProject'))
const Editor=lazy(()=>import('../pages/Editor'))
const Settings=lazy(()=>import('../pages/Settings'))
function ScrollReset(){const {pathname}=useLocation();useEffect(()=>{window.scrollTo(0,0)},[pathname]);return null}
export default function App(){const {theme,ready}=usePreferences();useEffect(()=>{void loadPreferences()},[]);useEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme},[theme]);return <MotionConfig reducedMotion="user"><BrowserRouter><ScrollReset/><Suspense fallback={<div className="full-loading"><Box/><p>Opening SpaceCraft…</p></div>}>{ready&&<Routes><Route path="/" element={<Landing/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/projects/new" element={<NewProject/>}/><Route path="/editor/:projectId" element={<Editor/>}/><Route path="/settings" element={<Settings/>}/><Route path="*" element={<main className="not-found"><Box size={40}/><span className="eyebrow">404 / UNCHARTED SPACE</span><h1>A little outside<br/>the floor plan.</h1><p>This page doesn’t exist. Your next great room still can.</p><Link className="button primary" to="/dashboard">Back to your workspace</Link></main>}/></Routes>}</Suspense></BrowserRouter></MotionConfig>}
