import { useForm } from "react-hook-form";

interface NovaSenhaFormData {
  password: string;
  confirmPassword: string;
}

export default function NovaSenha() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NovaSenhaFormData>();

  // TODO: substituir por integração com Better Auth quando o backend estiver pronto
  function onSubmit(data: NovaSenhaFormData) {
    console.log("redefinir senha (placeholder, sem integração ainda):", data);
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
          Criar nova senha
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-400">
          Link válido até 14:12 - Expira em 15 minutos
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Nova senha */}
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm text-zinc-300"
          >
            Nova senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Digite sua nova senha..."
            className="mb-1 w-full rounded-lg border border-zinc-600 bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#5C93E6] focus:outline-none focus:ring-1 focus:ring-[#5C93E6]"
            {...register("password", {
              required: "Informe a nova senha.",
              minLength: { value: 8, message: "Use pelo menos 8 caracteres." },
            })}
          />
          {errors.password && (
            <p className="mb-2 text-xs text-red-400">
              {errors.password.message}
            </p>
          )}

          {/* Confirmar nova senha */}
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 mt-4 block text-sm text-zinc-300"
          >
            Confirme nova senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirme sua nova senha..."
            className="mb-1 w-full rounded-lg border border-zinc-600 bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#5C93E6] focus:outline-none focus:ring-1 focus:ring-[#5C93E6]"
            {...register("confirmPassword", {
              required: "Confirme a nova senha.",
              validate: (value) =>
                value === watch("password") || "As senhas não coincidem.",
            })}
          />
          {errors.confirmPassword && (
            <p className="mb-2 text-xs text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-lg bg-[#5C93E6] py-2.5 text-sm font-medium text-white transition hover:bg-[#4d84d9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Redefinir senha
          </button>
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
