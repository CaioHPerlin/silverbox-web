import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { LoginFormData } from "../types";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  // TODO: substituir por integração com Better Auth quando o backend estiver pronto
  function onSubmit(data: LoginFormData) {
    console.log("login (placeholder, sem integração ainda):", data);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-8">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <CloudIcon className="h-6 w-6 text-[#5C93E6]" />
          <span className="text-lg font-semibold text-white">Minha Nuvem</span>
        </div>

        {/* Abas Entrar / Criar Conta */}
        <div className="mb-6 flex border-b border-zinc-700">
          <span className="flex-1 border-b-2 border-[#5C93E6] pb-2 text-center text-sm font-medium text-[#5C93E6]">
            Entrar
          </span>
          <Link
            to="/cadastro"
            className="flex-1 pb-2 text-center text-sm text-zinc-400 hover:text-zinc-200"
          >
            Criar Conta
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* E-mail */}
          <label htmlFor="email" className="mb-1.5 block text-sm text-zinc-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Digite seu e-mail..."
            className="mb-1 w-full rounded-lg border border-zinc-600 bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#5C93E6] focus:outline-none focus:ring-1 focus:ring-[#5C93E6]"
            {...register("email", {
              required: "Informe seu e-mail.",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "E-mail inválido." },
            })}
          />
          {errors.email && (
            <p className="mb-2 text-xs text-red-400">{errors.email.message}</p>
          )}

          {/* Senha */}
          <label htmlFor="password" className="mb-1.5 mt-4 block text-sm text-zinc-300">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha..."
            className="mb-1 w-full rounded-lg border border-zinc-600 bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#5C93E6] focus:outline-none focus:ring-1 focus:ring-[#5C93E6]"
            {...register("password", { required: "Informe sua senha." })}
          />
          {errors.password && (
            <p className="mb-2 text-xs text-red-400">{errors.password.message}</p>
          )}

          <div className="mb-4 mt-2 text-right">
            <Link to="/recuperar-senha" className="text-xs text-[#5C93E6] hover:underline">
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mb-4 w-full rounded-lg bg-white py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Entrar
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-700" />
            <span className="text-xs text-zinc-500">ou</span>
            <div className="h-px flex-1 bg-zinc-700" />
          </div>

          <button
            type="button"
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-600 bg-white py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            <GoogleIcon className="h-4 w-4" />
            Entre com o Google
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[11px] text-zinc-500">Sessão segura</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
          <p className="mt-2 text-center text-[11px] text-zinc-500">
            Senha nunca é armazenada em texto puro
          </p>
        </form>
      </div>
    </div>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="none" className={className} aria-hidden="true">
      <path
        d="M74 176c-27.6 0-50-22.4-50-50 0-25.9 19.7-47.2 45-49.8C75.6 54.6 96.4 40 120 40c26.9 0 49.5 18.8 55.2 44.1C199.3 86.4 218 106.9 218 132c0 26.5-21.5 48-48 48H74z"
        stroke="currentColor"
        strokeWidth={14}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v3h3.88c2.27-2.09 3.54-5.17 3.54-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.93H1.3v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.31A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.58.4-2.31V6.6H1.3A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.3 5.4z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.6l4 3.09C6.25 6.86 8.89 4.77 12 4.77z"
      />
    </svg>
  );
}
