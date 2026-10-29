import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowUpRight,
  Folder,
  LayoutTemplate,
  Plus,
  Settings,
} from "lucide-react";
import { Logo, ThemeToggle } from "./ui";
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <Logo />
        <div className="workspace-label">PERSONAL WORKSPACE</div>
        <nav>
          <NavLink to="/dashboard">
            <Folder size={18} />
            My projects
          </NavLink>
          <Link to="/dashboard?templates=1">
            <LayoutTemplate size={18} />
            Room templates
          </Link>
          <NavLink to="/settings">
            <Settings size={18} />
            Preferences
          </NavLink>
        </nav>
        <div className="sidebar-note">
          <span className="small-orbit">✳</span>
          <h4>
            A little space.
            <br />A lot of possibility.
          </h4>
          <p>Your next great room starts with an idea.</p>
          <Link className="text-link" to="/projects/new">
            Create something <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <div className="avatar">Y</div>
          <div>
            <strong>Your workspace</strong>
            <small>Saved on this device</small>
          </div>
          <ThemeToggle />
        </div>
      </aside>
      <div className="app-content">
        <header className="mobile-header">
          <Logo />
          <Link to="/dashboard">Projects</Link>
          <ThemeToggle />
          <Link to="/projects/new" aria-label="New project">
            <Plus />
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}
