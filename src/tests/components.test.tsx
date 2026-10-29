import { beforeEach,describe,expect,it } from 'vitest'
import { render,screen,fireEvent,waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeToggle,NumberField } from '../components/ui'
import { Library,Inspector } from '../features/editor/Panels'
import { useEditor } from '../features/editor/store'
import { usePreferences } from '../stores/preferences'
import { createProject } from '../features/templates/templates'
import NewProject from '../pages/NewProject'
import Dashboard from '../pages/Dashboard'
import { db } from '../db/database'
describe('accessible editing controls',()=>{beforeEach(()=>useEditor.getState().load(createProject('empty')));
 it('switches theme and persists it in IndexedDB',async()=>{usePreferences.setState({theme:'dark'});render(<ThemeToggle/>);await userEvent.click(screen.getByRole('button',{name:'Switch to light theme'}));expect(usePreferences.getState().theme).toBe('light');await waitFor(async()=>expect((await db.preferences.get('settings'))?.value).toMatchObject({theme:'light'}))})
 it('searches catalog and adds a selected object',async()=>{render(<Library/>);await userEvent.type(screen.getByLabelText('Search furniture'),'Luna queen');expect(screen.getAllByRole('button',{name:/^Add /})).toHaveLength(1);await userEvent.click(screen.getByRole('button',{name:'Add Luna queen bed'}));expect(useEditor.getState().project!.objects).toHaveLength(1);expect(useEditor.getState().selected).toBeTruthy()})
 it('synchronizes hierarchy selection and visibility',async()=>{useEditor.getState().add('desk');render(<Library/>);await userEvent.click(screen.getByRole('button',{name:/Scene/}));await userEvent.click(screen.getByRole('button',{name:'Hide Studio writing desk'}));expect(useEditor.getState().project!.objects[0].visible).toBe(false);await userEvent.click(screen.getByRole('button',{name:'Studio writing desk'}));expect(useEditor.getState().selected).toBe(useEditor.getState().project!.objects[0].id)})
 it('commits inspector dimensions on blur and can undo the edit',async()=>{useEditor.getState().add('bed');render(<Inspector onDelete={()=>{}}/>);const width=screen.getByLabelText('Width');fireEvent.change(width,{target:{value:'1.2'}});fireEvent.blur(width);expect(useEditor.getState().project!.objects[0].size[0]).toBe(1.2);useEditor.getState().undo();expect(useEditor.getState().project!.objects[0].size[0]).toBe(1.7)})
 it('rejects a blank numeric draft without changing state',()=>{let value=4;render(<NumberField label="Width" value={4} onChange={n=>{value=n}}/>);fireEvent.change(screen.getByLabelText('Width'),{target:{value:''}});fireEvent.blur(screen.getByLabelText('Width'));expect(value).toBe(4)})
 it('validates room creation before saving',async()=>{render(<MemoryRouter><NewProject/></MemoryRouter>);const input=screen.getByLabelText('Project name');await userEvent.clear(input);await userEvent.click(screen.getByRole('button',{name:'Open your studio'}));expect(await screen.findByText('Give your room a name.')).toBeInTheDocument()})
 it('loads and searches stored projects',async()=>{await db.projects.clear();await db.projects.add(createProject('empty','Quiet room'));render(<MemoryRouter><Dashboard/></MemoryRouter>);expect(await screen.findByRole('heading',{name:'Quiet room'})).toBeInTheDocument();await userEvent.type(screen.getByLabelText('Search projects'),'unmatched');expect(screen.getByText('No projects found')).toBeInTheDocument()})
})
