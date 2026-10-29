import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Project } from '../types/project'
class SpacecraftDB extends Dexie { projects!:Table<Project,string>; preferences!:Table<{key:string;value:unknown},string>;constructor(){super('spacecraft-studio');this.version(1).stores({projects:'id, name, updatedAt',preferences:'key'})}}
export const db=new SpacecraftDB()
