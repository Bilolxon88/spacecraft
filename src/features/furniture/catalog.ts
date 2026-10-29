export type Part = { shape: 'box' | 'cylinder' | 'sphere'; p: [number,number,number]; s: [number,number,number]; color?: string; rotation?: [number,number,number] }
export type CatalogItem = { id:string; name:string; category:string; size:[number,number,number]; color:string; parts:Part[]; solid:boolean }
const b=(x:number,y:number,z:number,w:number,h:number,d:number,color?:string):Part=>({shape:'box',p:[x,y,z],s:[w,h,d],color})
const c=(x:number,y:number,z:number,w:number,h:number,d:number,color?:string):Part=>({shape:'cylinder',p:[x,y,z],s:[w,h,d],color})
const s=(x:number,y:number,z:number,w:number,h:number,d:number,color?:string):Part=>({shape:'sphere',p:[x,y,z],s:[w,h,d],color})
const wood='#a77d52', dark='#35383c', white='#f0ebe2', green='#657c54'
const legs=(height=.4,spread=.38)=>[-1,1].flatMap(x=>[-1,1].map(z=>b(x*spread,height/2,z*spread,.055,height,.055,wood)))
const sofa=[b(0,.35,0,.9,.27,.8),b(0,.69,-.36,.94,.55,.19),b(-.44,.53,0,.12,.44,.85),b(.44,.53,0,.12,.44,.85),...[-.23,.23].map(x=>b(x,.52,.02,.4,.13,.62)),...legs(.18)]
const chair=[...legs(.48),b(0,.49,0,.92,.1,.86),b(0,.77,-.38,.9,.46,.1)]
const bed=[b(0,.23,0,.96,.32,.98,wood),b(0,.43,.02,.93,.17,.91,white),b(0,.7,-.46,1,.6,.08),b(0,.54,.19,.94,.08,.55),b(-.24,.56,-.28,.39,.1,.23,white),b(.24,.56,-.28,.39,.1,.23,white)]
const desk=[b(0,.93,0,1,.09,1,wood),...legs(.9,.43)]
const cabinet=[b(0,.52,0,.98,.87,.93),b(-.24,.53,.48,.47,.79,.04),b(.24,.53,.48,.47,.79,.04),b(-.06,.56,.52,.025,.16,.03,dark),b(.06,.56,.52,.025,.16,.03,dark),...legs(.12)]
const shelf=[b(-.46,.5,0,.08,1,.9,wood),b(.46,.5,0,.08,1,.9,wood),...Array.from({length:5},(_,i)=>b(0,.04+i*.23,0,.92,.045,.9,wood)),...Array.from({length:6},(_,i)=>b(-.3+i*.1,.39,.05,.07,.19,.6,['#968a7a','#627d7b','#b08b72'][i%3]))]
const lamp=[c(0,.025,0,.45,.05,.45,dark),c(0,.46,0,.035,.86,.035,dark),c(0,.85,0,.7,.28,.7,white)]
const plant=[c(0,.15,0,.5,.3,.5,'#c2aa91'),c(0,.52,0,.045,.65,.045,wood),...[-1,1].flatMap(x=>[s(x*.19,.65,0,.36,.48,.25,green),s(0,.8,x*.14,.3,.4,.3,green)])]
const item=(id:string,name:string,category:string,size:[number,number,number],color:string,parts:Part[],solid=true):CatalogItem=>({id,name,category,size,color,parts,solid})
export const catalog:CatalogItem[]=[
 item('stone-coffee-table','Atelier marble coffee table','Tables',[1.1,.415,1.1],'#d4cbbb',[c(0,.9,0,1,.15,1),c(0,.45,0,.7,.9,.7)]),
 item('pendant','Opal pendant light','Lamps',[.43,.95,.43],'#eee8dc',lamp,false),
 item('sofa','Haven sofa','Sofas',[2.3,.86,.95],'#d5cbbb',sofa),
 item('sectional','Forma sectional','Sofas',[2.9,.88,1.6],'#a6aaa1',[...sofa,b(.23,.37,.4,.42,.27,1.1),b(.23,.54,.42,.4,.1,1)]),
 item('loveseat','Milo loveseat','Sofas',[1.6,.82,.85],'#b49075',sofa.map(p=>({...p,s:[p.s[0],p.s[1],p.s[2]]}))),
 item('armchair','Sol lounge chair','Armchairs',[.85,.85,.83],'#c4a482',sofa),
 item('accent-chair','Arc accent chair','Armchairs',[.8,.83,.8],'#7c897b',[...chair,b(-.43,.65,0,.07,.07,.7,wood),b(.43,.65,0,.07,.07,.7,wood)]),
 item('ottoman','Pebble ottoman','Armchairs',[.65,.42,.65],'#bdada2',[c(0,.5,0,.95,.9,.95),c(0,.08,0,.7,.08,.7,wood)]),
 item('bed','Luna queen bed','Beds',[1.7,1.1,2.1],'#c1b29f',bed),
 item('single-bed','Nest single bed','Beds',[1,1,2],'#8d9a9b',bed.filter((_,i)=>i!==5)),
 item('canopy-bed','Frame canopy bed','Beds',[1.8,2.2,2.2],'#c7bbae',[...bed.map(p=>({...p,p:[p.p[0],p.p[1]*.45,p.p[2]] as [number,number,number],s:[p.s[0],p.s[1]*.45,p.s[2]] as [number,number,number]})),...[-.47,.47].flatMap(x=>[-.47,.47].map(z=>b(x,.5,z,.025,1,.025,dark))),b(0,.99,-.47,.96,.02,.025,dark),b(0,.99,.47,.96,.02,.025,dark),b(-.47,.99,0,.025,.02,.96,dark),b(.47,.99,0,.025,.02,.96,dark)]),
 item('coffee-table','Gather coffee table','Tables',[1.15,.38,.65],wood,[b(0,.89,0,1,.15,1),...legs(.8,.35)]),
 item('round-table','Orbit side table','Tables',[.55,.52,.55],wood,[c(0,.93,0,1,.12,1),c(0,.47,0,.14,.9,.14),c(0,.04,0,.65,.08,.65)]),
 item('dining-table','Noma dining table','Tables',[1.7,.75,.9],wood,desk),
 item('dining-chair','Noma dining chair','Chairs',[.46,.82,.5],'#c8c0af',chair),
 item('office-chair','Task office chair','Chairs',[.65,1.1,.65],dark,[c(0,.04,0,.9,.08,.9,dark),c(0,.25,0,.07,.45,.07,dark),b(0,.48,0,.8,.12,.8),b(0,.76,-.34,.75,.43,.12),b(-.42,.62,0,.07,.06,.6),b(.42,.62,0,.07,.06,.6)]),
 item('stool','Perch bar stool','Chairs',[.42,.76,.42],'#c7ad8b',[c(0,.94,0,1,.1,1),...legs(.9)]),
 item('desk','Studio writing desk','Desks',[1.4,.75,.65],wood,desk),
 item('standing-desk','Rise standing desk','Desks',[1.5,1.05,.7],'#d8d7d1',[b(0,.95,0,1,.08,1),b(-.4,.47,0,.05,.9,.1,dark),b(.4,.47,0,.05,.9,.1,dark),b(-.4,.03,0,.12,.06,.9,dark),b(.4,.03,0,.12,.06,.9,dark)]),
 item('wardrobe','Linea wardrobe','Wardrobes',[1.5,2.1,.6],'#d4cbbd',cabinet),
 item('open-wardrobe','Rail open wardrobe','Wardrobes',[1.1,1.9,.5],wood,[...shelf.slice(0,2),b(0,.08,0,1,.05,1),b(0,.95,0,1,.04,.05,dark),b(0,.6,0,.55,.56,.3,'#8f9690')]),
 item('sideboard','Terra sideboard','Cabinets',[1.5,.75,.45],wood,cabinet),
 item('nightstand','Luna nightstand','Cabinets',[.5,.5,.42],'#ac8b67',[...cabinet,b(0,.7,.52,.13,.025,.03,dark)]),
 item('bookshelf','Archive bookshelf','Shelves',[.9,1.8,.32],wood,shelf),
 item('low-shelf','Lowline media unit','Shelves',[1.7,.48,.4],'#a58a69',shelf.slice(0,5)),
 item('floor-lamp','Halo floor lamp','Lamps',[.5,1.6,.5],'#e6dfd1',lamp),
 item('table-lamp','Dune table lamp','Lamps',[.35,.5,.35],'#c6a785',[c(0,.3,0,.4,.6,.4),c(0,.76,0,1,.45,1,white)]),
 item('arc-lamp','Reach arc lamp','Lamps',[.85,1.85,.45],dark,[c(-.35,.03,0,.4,.06,.7,dark),c(-.35,.5,0,.025,.95,.05,dark),b(0,.96,0,.72,.025,.05,dark),s(.35,.87,0,.3,.17,.65,white)]),
 item('plant','Olive indoor tree','Plants',[.65,1.55,.65],green,plant),
 item('snake-plant','Sansevieria','Plants',[.35,.7,.35],green,[c(0,.18,0,.8,.35,.8,'#b99d87'),...[-.22,0,.22].map(x=>s(x,.62,0,.18,.75,.3,green))]),
 item('rug','Woven area rug','Decorations',[2.3,.025,1.6],'#c8bca7',[b(0,.5,0,1,1,1)],false),
 item('mirror','Arch floor mirror','Decorations',[.6,1.7,.08],'#99abad',[b(0,.5,0,1,1,1,wood),b(0,.51,.52,.9,.94,.03)],false),
 item('vase','Forma ceramic vase','Decorations',[.25,.45,.25],'#ad8067',[s(0,.35,0,.9,.7,.9),c(0,.78,0,.38,.4,.38)],false),
 item('gaming-desk','Command gaming desk','Gaming',[1.6,.78,.75],dark,[...desk,b(0,.86,.48,.97,.025,.02,'#8b8cff')]),
 item('monitor','Studio monitor','Gaming',[.65,.48,.18],dark,[b(0,.62,0,1,.73,.15),b(0,.62,.085,.94,.64,.01,'#71799a'),b(0,.22,0,.06,.4,.1),b(0,.03,0,.5,.06,.9)]),
 item('kitchen-counter','Prep kitchen counter','Kitchen',[1.4,.9,.6],'#c9c5b7',[...cabinet,b(0,.97,0,1.03,.06,1.04,white)]),
 item('kitchen-island','Gather kitchen island','Kitchen',[1.6,.9,.8],'#8b9685',[...cabinet,b(0,.97,0,1.12,.08,1.15,white),b(0,.99,0,.42,.03,.55,dark)]),
 item('fridge','Chill refrigerator','Kitchen',[.7,1.85,.7],'#aeb5b6',[b(0,.5,0,1,1,.96),b(0,.78,.49,.97,.4,.04),b(0,.28,.49,.97,.55,.04),b(.35,.66,.54,.035,.2,.04,dark),b(.35,.39,.54,.035,.2,.04,dark)])
]
export const catalogById=Object.fromEntries(catalog.map(i=>[i.id,i]))
export const categories=['All',...new Set(catalog.map(i=>i.category))]
export const materials={oak:{color:'#b99a73',roughness:.72,metalness:0},walnut:{color:'#76543c',roughness:.65,metalness:0},marble:{color:'#e0ded7',roughness:.23,metalness:.05},concrete:{color:'#a3a39f',roughness:.95,metalness:0},'matte black':{color:'#343637',roughness:.85,metalness:0},'white lacquer':{color:'#eeeae1',roughness:.2,metalness:.05},'brushed metal':{color:'#a8b0b4',roughness:.35,metalness:.85},'neutral fabric':{color:'#c8bca7',roughness:1,metalness:0}}
export type MaterialName=keyof typeof materials
