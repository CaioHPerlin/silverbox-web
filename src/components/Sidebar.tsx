import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
          isActive ? "bg-blue-500/15 text-blue-400" : "text-gray-300 hover:bg-white/5"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-white/10 p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 px-3 py-2 mb-4">
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 001-9.9A6 6 0 006 9.1 4 4 0 003 15z" />
        </svg>
        <span className="font-semibold">Minha nuvem</span>
      </div>

      <NavItem
        to="/arquivos"
        label="Meus arquivos"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        }
      />
      <NavItem
        to="/compartilhados"
        label="Compartilhados"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656M8.464 14.828a4 4 0 010-5.656m9.192 9.192a8 8 0 10-11.314 0" />
          </svg>
        }
      />
      <NavItem
        to="/lixeira"
        label="Lixeira"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
          </svg>
        }
      />
      <NavItem
        to="/perfil"
        label="Meu perfil"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />
    </aside>
  );
}