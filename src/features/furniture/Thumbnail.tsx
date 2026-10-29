import type { CatalogItem } from './catalog'
import { useState } from 'react'
import { modelAssets } from './modelAssets'
export default function Thumbnail({item}:{item:CatalogItem}) {
 const [failed,setFailed]=useState(false)
 const thumbnail=modelAssets[item.id]?.thumbnail
 return thumbnail&&!failed?<img src={thumbnail} alt="" loading="lazy" onError={()=>setFailed(true)}/>:<VectorThumbnail item={item}/>
}
// Original vector thumbnails project the same primitive recipe used by the 3D model.
function VectorThumbnail({item}:{item:CatalogItem}){const scale=60/Math.max(...item.size);const project=(x:number,y:number,z:number)=>[80+(x-z)*.78*scale,91+(x+z)*.34*scale-y*scale];const parts=[...item.parts].sort((a,b)=>(a.p[0]+a.p[2]+a.p[1])-(b.p[0]+b.p[2]+b.p[1]));return <svg viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="100" rx="47" ry="9" fill="#0000000c"/>{parts.map((p,i)=>{const [x,y,z]=p.p.map((v,j)=>v*item.size[j]);const [w,h,d]=p.s.map((v,j)=>v*item.size[j]);const points=(coords:number[][])=>coords.map(([a,b,c])=>project(a,b,c).join(',')).join(' ');const fill=p.color||item.color;if(p.shape==='sphere'){const center=project(x,y,z);return <ellipse key={i} cx={center[0]} cy={center[1]} rx={Math.max(w,d)*scale*.5} ry={h*scale*.5} fill={fill}/>}return <g key={i} stroke="#00000012" strokeWidth=".5"><polygon fill={fill} points={points([[x-w/2,y-h/2,z+d/2],[x+w/2,y-h/2,z+d/2],[x+w/2,y+h/2,z+d/2],[x-w/2,y+h/2,z+d/2]])}/><polygon fill={fill} style={{filter:'brightness(.86)'}} points={points([[x+w/2,y-h/2,z-d/2],[x+w/2,y-h/2,z+d/2],[x+w/2,y+h/2,z+d/2],[x+w/2,y+h/2,z-d/2]])}/><polygon fill={fill} style={{filter:'brightness(1.08)'}} points={points([[x-w/2,y+h/2,z-d/2],[x+w/2,y+h/2,z-d/2],[x+w/2,y+h/2,z+d/2],[x-w/2,y+h/2,z+d/2]])}/></g>})}</svg>}
