import { useState } from "react";
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  onNavigate?: () => void;
}
function NavItem({ to, icon, label, onNavigate }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? "bg-blue-500/15 text-blue-400"
            : "text-gray-300 hover:bg-white/5"
        }`
      }
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-5 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 first:mt-0">
      {children}
    </p>
  );
}

function CloudIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-blue-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 15a4 4 0 004 4h9a5 5 0 001-9.9A6 6 0 006 9.1 4 4 0 003 15z"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 11.5L12 4l9 7.5M5 10v9a1 1 0 001 1h4v-5a1 1 0 011-1h2a1 1 0 011 1v5h4a1 1 0 001-1v-9"
      />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-1a4 4 0 00-3-3.87M9 20H4v-1a4 4 0 013-3.87m5-3.13a4 4 0 100-8 4 4 0 000 8zm6 1a3 3 0 100-6 3 3 0 000 6z"
      />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-9-9 9 9 0 019 9z"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Navegação administrativa" className="flex flex-col">
      <SectionLabel>Minha conta</SectionLabel>
      <NavItem
        to="/admin/dashboard"
        label="Dashboard"
        icon={<HomeIcon />}
        onNavigate={onNavigate}
      />
      <NavItem
        to="/admin/arquivos"
        label="Meus arquivos"
        icon={<FolderIcon />}
        onNavigate={onNavigate}
      />

      <SectionLabel>Administração</SectionLabel>
      <div className="flex flex-col gap-2">
        <NavItem
          to="/admin/usuarios"
          label="Usuários"
          icon={<UsersIcon />}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/admin/auditoria"
          label="Auditoria"
          icon={<AuditIcon />}
          onNavigate={onNavigate}
        />
        <NavItem
          to="/admin/sistema"
          label="Sistema"
          icon={<SystemIcon />}
          onNavigate={onNavigate}
        />
      </div>
    </nav>
  );
}

interface AdminAccountProps {
  name: string;
  email: string;
}

function AdminAccount({ name, email }: AdminAccountProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="mt-auto flex items-center gap-3 border-t border-white/10 px-2 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-200">{email}</p>
        <p className="text-xs text-gray-500">Admin</p>
      </div>
    </div>
  );
}

interface AdminSidebarProps {
  name?: string;
  email?: string;
}

export default function AdminSidebar({
  name = "Roberto Barbosa",
  email = "roberto@barborsa",
}: AdminSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Menu para celular e tablet */}
      <header className="relative z-40 flex w-full items-center justify-between border-b border-white/10 bg-[#0b1120] px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <CloudIcon />
          <span className="font-semibold text-white">Minha Nuvem</span>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-gray-200 transition hover:bg-white/10"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-admin-navigation"
        >
          {menuOpen ? (
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </header>

      {/* Fundo escuro atrás do menu aberto */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* Painel lateral no celular e tablet */}
      <aside
        id="mobile-admin-navigation"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-white/10 bg-[#0b1120] p-4 transition-transform duration-200 md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu móvel administrativo"
        aria-hidden={!menuOpen}
      >
        <div className="mb-4 flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <CloudIcon />
            <span className="font-semibold text-white">Minha Nuvem</span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg p-2 text-gray-300 hover:bg-white/10"
            aria-label="Fechar menu"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        <span className="mb-6 inline-block rounded-md bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300">
          Painel administrativo
        </span>

        <div className="flex h-[calc(100%-6rem)] flex-col">
          <Navigation onNavigate={() => setMenuOpen(false)} />
          <AdminAccount name={name} email={email} />
        </div>
      </aside>

      {/* Sidebar permanente no computador */}
      <aside className="hidden min-h-screen w-56 shrink-0 border-r border-white/10 p-4 md:block lg:w-64">
        <div className="mb-4 flex items-center gap-2 px-2 py-2">
          <CloudIcon />
          <h1 className="font-semibold text-white">Minha Nuvem</h1>
        </div>

        <span className="mb-6 inline-block rounded-md bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300">
          Painel administrativo
        </span>

        <div className="flex min-h-[calc(100vh-7rem)] flex-col">
          <Navigation />
          <AdminAccount name={name} email={email} />
        </div>
      </aside>
    </>
  );
}
