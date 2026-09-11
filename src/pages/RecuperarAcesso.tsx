import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

interface RecuperarAcessoFormData {
  email: string;
}

export default function RecuperarAcesso() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarAcessoFormData>();

  // TODO: substituir por integração com Better Auth quando o backend estiver pronto
  function onSubmit(data: RecuperarAcessoFormData) {
    console.log("recuperar acesso (placeholder, sem integração ainda):", data);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-8">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <CloudIcon className="h-6 w-6 text-[#5C93E6]" />
          <span className="text-lg font-semibold text-white">Minha Nuvem</span>
        </div>

        <h1 className="mb-2 text-center text-base font-semibold text-white">
          Recuperar Acesso
        </h1>
        <p className="mx-auto mb-6 max-w-[280px] text-center text-sm text-zinc-400">
          Informe o e-mail que enviaremos um link para redefinição da sua senha
        </p>

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

          <button
            type="submit"
            disabled={isSubmitting}
            className="mb-4 mt-4 w-full rounded-lg bg-[#5C93E6] py-2.5 text-sm font-medium text-white transition hover:bg-[#4d84d9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Enviar link de recuperação
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-[#5C93E6] hover:underline"
            >
              Voltar para login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      className={className}
      aria-hidden="true"
    >
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
