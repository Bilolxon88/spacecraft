import { z } from 'zod'
import { catalogById, materials } from '../features/furniture/catalog'
const finite=z.number().finite()
const color=z.string().regex(/^#[0-9a-fA-F]{6}$/)
export const materialSchema=z.object({preset:z.enum(Object.keys(materials) as [keyof typeof materials,...(keyof typeof materials)[]]),color,roughness:finite.min(0).max(1),metalness:finite.min(0).max(1)})
export const objectSchema=z.object({id:z.string().min(1).max(100),catalogId:z.string().refine(id=>!!catalogById[id],'Unknown furniture model'),name:z.string().trim().min(1).max(80),position:z.tuple([finite.min(-25).max(25),finite.min(0).max(5),finite.min(-25).max(25)]),rotation:finite.min(-Math.PI*100).max(Math.PI*100),size:z.tuple([finite.min(.02).max(15),finite.min(.02).max(5),finite.min(.02).max(15)]),material:materialSchema,visible:z.boolean(),locked:z.boolean()})
export const roomSchema=z.object({width:finite.min(2).max(15),length:finite.min(2).max(15),height:finite.min(2).max(5),wallColor:color,floor:materialSchema,exposure:finite.min(.3).max(2),lighting:z.enum(['day','night'])})
export const projectSchema=z.object({schemaVersion:z.literal(1),id:z.string().min(1).max(100),name:z.string().trim().min(1).max(80),type:z.string().max(50),units:z.enum(['m','cm']),createdAt:finite,updatedAt:finite,favorite:z.boolean(),room:roomSchema,objects:z.array(objectSchema).max(250)}).superRefine((p,ctx)=>{if(new Set(p.objects.map(o=>o.id)).size!==p.objects.length)ctx.addIssue({code:'custom',message:'Object IDs must be unique',path:['objects']})})
export type Room= z.infer<typeof roomSchema>
export type Furniture= z.infer<typeof objectSchema>
export type Project= z.infer<typeof projectSchema>
export type Surface= z.infer<typeof materialSchema>
export const surface=(preset:keyof typeof materials='oak'):Surface=>({preset,...materials[preset]})
export function makeObject(catalogId:string,x=0,z=0):Furniture {const i=catalogById[catalogId];return {id:crypto.randomUUID(),catalogId,name:i.name,position:[x,catalogId==='pendant'?1.85:0,z],rotation:0,size:[...i.size],material:{...surface('neutral fabric'),color:i.color},visible:true,locked:false}}

