import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authClient } from "../lib/authClient";

interface RecuperarAcessoFormData {
  email: string;
}

export default function RecuperarAcesso() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarAcessoFormData>();

  const [erro, setErro] = useState<string | null>(null);
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);

  async function onSubmit({ email }: RecuperarAcessoFormData) {
    setErro(null);
    const destino = email.trim();

    const res = await authClient.requestPasswordReset({
      email: destino,
      // URL absoluta do front; precisa estar em trustedOrigins no back
      redirectTo: `${window.location.origin}/nova-senha`,
    });

    if (res.error) {
      const status = res.error.status ?? 0;
      if (status === 429) {
        setErro("Muitas tentativas. Aguarde um pouco e tente de novo.");
        return;
      }
      if (status >= 500 || status === 0) {
        setErro("Serviço indisponível no momento. Tente mais tarde.");
        return;
      }
      // demais erros (ex.: e-mail inexistente): mesma resposta, sem revelar a conta
    }

    setEnviadoPara(destino);
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
          Recuperar Acesso
        </h1>

        {enviadoPara ? (
          <>
            <p className="mx-auto mb-6 max-w-[280px] text-center text-sm text-zinc-400">
              Se existir uma conta com o e-mail{" "}
              <span className="text-zinc-200">{enviadoPara}</span>, enviamos um
              link para redefinir a senha. Confira também a caixa de spam.
            </p>

            <button
              type="button"
              onClick={() => setEnviadoPara(null)}
              className="mb-4 w-full rounded-lg border border-zinc-600 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/5"
            >
              Usar outro e-mail
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-[#5C93E6] hover:underline"
              >
                Voltar para login
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mx-auto mb-6 max-w-[280px] text-center text-sm text-zinc-400">
              Informe o e-mail que enviaremos um link para redefinição da sua
              senha
            </p>

            {erro && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* E-mail */}
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm text-zinc-300"
              >
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
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "E-mail inválido.",
                  },
                })}
              />
              {errors.email && (
                <p className="mb-2 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mb-4 mt-4 w-full rounded-lg bg-[#5C93E6] py-2.5 text-sm font-medium text-white transition hover:bg-[#4d84d9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
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
          </>
        )}
      </div>
    </div>
  );
}
