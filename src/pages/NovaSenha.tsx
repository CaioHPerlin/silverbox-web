import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authClient } from "../lib/authClient";

interface NovaSenhaFormData {
  password: string;
  confirmPassword: string;
}

export default function NovaSenha() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const linkInvalido = !token || params.get("error") !== null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NovaSenhaFormData>();

  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);

  async function onSubmit({ password }: NovaSenhaFormData) {
    if (!token) return;
    setErro(null);

    const res = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (res.error) {
      setErro(
        res.error.code === "INVALID_TOKEN" || res.error.status === 400
          ? "Este link é inválido ou expirou."
          : (res.error.message ?? "Não foi possível redefinir a senha."),
      );
      return;
    }

    setConcluido(true);
    setTimeout(() => navigate("/login", { replace: true }), 2500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-8">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <img
            src="/minha-nuvem-logo.png"
            alt="Logo Silverbox"
            className="h-10 w-42 object-contain"
          />
        </div>

        <h1 className="mb-2 text-center text-base font-semibold text-white">
          Criar nova senha
        </h1>

        {linkInvalido ? (
          <>
            <p className="mb-6 text-center text-sm text-zinc-400">
              Este link é inválido ou expirou. Solicite um novo para continuar.
            </p>
            <Link
              to="/recuperar-acesso"
              className="block w-full rounded-lg bg-[#5C93E6] py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#4d84d9]"
            >
              Pedir novo link
            </Link>
          </>
        ) : concluido ? (
          <p className="text-center text-sm text-emerald-400">
            Senha alterada com sucesso. Redirecionando para o login...
          </p>
        ) : (
          <>
            <p className="mb-6 text-center text-sm text-zinc-400">
              O link de redefinição tem validade limitada.
            </p>

            {erro && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                {erro}{" "}
                <Link to="/recuperar-acesso" className="underline">
                  Pedir novo link
                </Link>
              </div>
            )}

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
                  minLength: {
                    value: 8,
                    message: "Use pelo menos 8 caracteres.",
                  },
                  maxLength: {
                    value: 128,
                    message: "Use no máximo 128 caracteres.",
                  },
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
                {isSubmitting ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
