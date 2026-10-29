import { create } from 'zustand'
import type { Furniture, Project, Room } from '../../types/project'
import { makeObject,projectSchema } from '../../types/project'
import { constrainObject,placeObject } from './geometry'
type History={label:string;project:Project}
type EditorState={project:Project|null;selected:string|null;past:History[];future:History[];revision:number;savedRevision:number;saveStatus:'Unsaved'|'Saving'|'Saved'|'Save failed';mode:'orbit'|'top'|'front'|'side'|'walk';tool:'translate'|'rotate'|'scale';load:(p:Project)=>void;commit:(label:string,fn:(p:Project)=>Project)=>void;select:(id:string|null)=>void;add:(id:string)=>void;update:(id:string,patch:Partial<Furniture>)=>void;room:(patch:Partial<Room>)=>void;remove:()=>void;duplicate:()=>void;undo:()=>void;redo:()=>void}
export const useEditor=create<EditorState>((set,get)=>({project:null,selected:null,past:[],future:[],revision:0,savedRevision:0,saveStatus:'Saved',mode:'orbit',tool:'translate',
 load:project=>set({project,selected:null,past:[],future:[],revision:0,savedRevision:0,saveStatus:'Saved',mode:'orbit'}),
 commit:(label,fn)=>{const {project,past,revision}=get();if(!project)return;const next=fn(structuredClone(project));if(JSON.stringify(next)===JSON.stringify(project))return;const parsed=projectSchema.safeParse({...next,updatedAt:Date.now()});if(!parsed.success)return;set({project:parsed.data,past:[...past,{label,project}].slice(-80),future:[],revision:revision+1,saveStatus:'Unsaved'})},
 select:selected=>set({selected}),
 add:id=>{const p=get().project;if(!p||p.objects.length>=250)return;const o=placeObject(makeObject(id),p.room,p.objects);get().commit('Add '+o.name,p=>({...p,objects:[...p.objects,o]}));set({selected:o.id})},
 update:(id,patch)=>get().commit('Edit object',p=>({...p,objects:p.objects.map(o=>o.id===id?constrainObject({...o,...patch},p.room):o)})),
 room:patch=>get().commit('Edit room',p=>{const room={...p.room,...patch};return {...p,room,objects:p.objects.map(o=>constrainObject(o,room))}}),
 remove:()=>{const {selected,project}=get();if(project?.objects.find(o=>o.id===selected)?.locked)return;get().commit('Delete object',p=>({...p,objects:p.objects.filter(o=>o.id!==selected)}));set({selected:null})},
 duplicate:()=>{const p=get().project;const old=p?.objects.find(o=>o.id===get().selected);if(!p||!old||p.objects.length>=250)return;const o=placeObject({...structuredClone(old),id:crypto.randomUUID(),name:old.name.slice(0,74)+' copy',locked:false},p.room,p.objects);get().commit('Duplicate object',p=>({...p,objects:[...p.objects,o]}));set({selected:o.id})},
 undo:()=>{const {past,project,future,revision}=get();const last=past.at(-1);if(!last||!project)return;set({project:last.project,past:past.slice(0,-1),future:[...future,{label:last.label,project}],revision:revision+1,saveStatus:'Unsaved',selected:null})},
 redo:()=>{const {past,project,future,revision}=get();const last=future.at(-1);if(!last||!project)return;set({project:last.project,future:future.slice(0,-1),past:[...past,{label:last.label,project}],revision:revision+1,saveStatus:'Unsaved',selected:null})}
}))
