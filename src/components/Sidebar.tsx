import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCota } from "../hooks/useCota";
import { formatBytes } from "../lib/format";
import type { Cota } from "../services/storage";
import { CreditCard, FolderPlus, FileUp } from "lucide-react";

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
        d="M3 10.5L12 3l9 7.5M5 9v11h14V9M9 20v-6h6v6"
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

function SharedIcon() {
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
        d="M13.828 10.172a4 4 0 010 5.656M8.464 14.828a4 4 0 010-5.656m9.192 9.192a8 8 0 10-11.314 0"
      />
    </svg>
  );
}

function TrashIcon() {
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
      />
    </svg>
  );
}

function UserIcon() {
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-2">
      <NavItem
        to="/"
        label="Tela Inicial"
        icon={<HomeIcon />}
        onNavigate={onNavigate}
      />
      <NavItem
        to="/arquivos"
        label="Meus arquivos"
        icon={<FolderIcon />}
        onNavigate={onNavigate}
      />
      <NavItem
        to="/compartilhados"
        label="Compartilhados"
        icon={<SharedIcon />}
        onNavigate={onNavigate}
      />
      <NavItem
        to="/lixeira"
        label="Lixeira"
        icon={<TrashIcon />}
        onNavigate={onNavigate}
      />
      <NavItem
        to="/perfil"
        label="Meu perfil"
        icon={<UserIcon />}
        onNavigate={onNavigate}
      />
      <NavItem
        to="/planos"
        label="Planos"
        icon={<CreditCard className="h-5 w-5" aria-hidden="true" />}
        onNavigate={onNavigate}
      />
    </nav>
  );
}

function AccountUsage({ cota }: { cota: Cota | null }) {
  const usedPercent = cota
    ? Math.min((cota.usedBytes / cota.limitBytes) * 100, 100)
    : 0;

  return (
    <div className="mt-auto mb-2">
      {" "}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Uso da conta
      </p>
      <div className="rounded-xl border border-white/20 p-4">
        <div className="mb-3 flex items-center justify-between gap-2 text-xs">
          <span className="text-gray-300">
            {cota
              ? `${formatBytes(cota.usedBytes)} de ${formatBytes(cota.limitBytes)} usados`
              : "Carregando..."}
          </span>
        </div>

        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-label="Armazenamento utilizado"
          aria-valuenow={Math.round(usedPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${usedPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
    >
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5m5 5H3"
        />
      </svg>

      <span>Sair</span>
    </button>
  );
}

//Função para abrir +Novo arquivo
function NewMenu({
  onAction,
}: {
  onAction: (action: "new-folder" | "upload") => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mt-2 mb-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-xl bg-[#30343b] px-4 py-2 font-medium text-white  transition-colors hover:bg-[#3b414a]"
      >
        <span className="text-2xl leading-none">+</span>
        Novo
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#252525] py-2 shadow-xl">
          <button
            type="button"
            onClick={() => {
              onAction("new-folder");
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10"
          >
            <FolderPlus
              size={19}
              strokeWidth={1.8}
              className="shrink-0 text-gray-300"
            />
            Nova pasta
          </button>

          <button
            type="button"
            onClick={() => {
              onAction("upload");
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/10"
          >
            <FileUp
              size={19}
              strokeWidth={1.8}
              className="shrink-0 text-gray-300"
            />
            Upload de arquivo
          </button>
        </div>
      )}
    </div>
  );
}
export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const { cota } = useCota();

  const navigate = useNavigate();

  function handleNewAction(action: "new-folder" | "upload") {
    navigate("/arquivos", {
      state: { sidebarAction: action },
    });

    setMenuOpen(false);
  }

  return (
    <>
      {/* Menu para celular e tablet */}
      <header className="relative z-40 flex w-full items-center justify-between border-b border-white/10 bg-[##1c1c1c] px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <img
            src="/minha-nuvem-logo.png"
            alt="Logo Silverbox"
            className="h-9 w-9 object-contain"
          />
          <span className="font-semibold text-white">Silverbox</span>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-gray-200 transition hover:bg-white/10"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
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
          className="fixed inset-0 z-40 bg-#1c1c1c/60 md:hidden"
        />
      )}

      {/* Painel lateral no celular e tablet */}
      <aside
        id="mobile-navigation"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-white/10 bg-[#1c1c1c] p-4 transition-transform duration-200 md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu móvel"
        aria-hidden={!menuOpen}
      >
        <div className="mb-8 flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <img
              src="/minha-nuvem-logo.png"
              alt="Logo Silverbox"
              className="h-9 w-9 object-contain"
            />
            <span className="font-semibold text-white">Silverbox</span>
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

        <div className="flex h-[calc(100%-4rem)] flex-col">
          <NewMenu onAction={handleNewAction} />
          <Navigation onNavigate={() => setMenuOpen(false)} />
          <AccountUsage cota={cota} />
          <div className="mt-2">
            <LogoutButton onClick={logout} />
          </div>
        </div>
      </aside>

      {/* Sidebar permanente no computador */}
      <aside className="hidden pd-4 min-h-screen w-56 shrink-0 border-r bg-[#1c1c1c] border-white/10 p-4 md:block lg:w-64">
        <div className="mb-6 flex items-center gap-2 px-2 py-2">
          <img
            src="/minha-nuvem-logo.png"
            alt="Logo Silverbox"
            className="h-6 w-9 object-contain"
          />
          <h1 className="font-medium text-white">Silverbox</h1>
        </div>

        <div className="flex min-h-[calc(100vh-5rem)] flex-col">
          <NewMenu onAction={handleNewAction} />
          <Navigation />
          <AccountUsage cota={cota} />
          <div className="mt-2">
            <LogoutButton onClick={logout} />
          </div>
        </div>
      </aside>
    </>
  );
}
