import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

interface CadastroForm {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export default function Cadastro() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CadastroForm>();

  const senha = watch("senha");

  function onSubmit(data: CadastroForm) {
    // TODO: chamar a API de cadastro (POST /usuarios) com { nome, email, senha }
    console.log(data);
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-white/10 rounded-2xl p-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 001-9.9A6 6 0 006 9.1 4 4 0 003 15z" />
          </svg>
          <span className="text-xl font-semibold">Minha Nuvem</span>
        </div>

        {/* Abas Entrar / Criar Conta */}
        <div className="flex border-b border-white/10 mb-6">
          <Link
            to="/login"
            className="flex-1 text-center pb-3 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Entrar
          </Link>
          <button className="flex-1 text-center pb-3 text-sm font-medium text-blue-400 border-b-2 border-blue-400 -mb-px">
            Criar Conta
          </button>
        </div>

        {/* Cadastro com Google */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 transition-colors rounded-lg py-2.5 text-sm font-medium mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z" />
            <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 015.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 001 12c0 1.77.42 3.45 1.18 4.94l3.66-2.85z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.06l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          Crie sua conta com o google
        </button>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1.5">Nome</label>
            <input
              type="text"
              placeholder="Joao da Silva"
              {...register("nome", { required: "Informe seu nome" })}
              className="w-full bg-transparent border border-white/15 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.nome && <p className="text-xs text-red-400 mt-1">{errors.nome.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1.5">E-mail</label>
            <input
              type="email"
              placeholder="nome@exemplo.com"
              {...register("email", {
                required: "Informe seu e-mail",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "E-mail inválido" },
              })}
              className="w-full bg-transparent border border-white/15 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1.5">Senha</label>
            <input
              type="password"
              placeholder="********"
              {...register("senha", {
                required: "Informe uma senha",
                minLength: { value: 8, message: "Mínimo de 8 caracteres" },
              })}
              className="w-full bg-transparent border border-white/15 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.senha && <p className="text-xs text-red-400 mt-1">{errors.senha.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1.5">Confirmar senha</label>
            <input
              type="password"
              placeholder="nome@exemplo.com"
              {...register("confirmarSenha", {
                required: "Confirme sua senha",
                validate: (value) => value === senha || "As senhas não coincidem",
              })}
              className="w-full bg-transparent border border-white/15 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.confirmarSenha && (
              <p className="text-xs text-red-400 mt-1">{errors.confirmarSenha.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-white text-gray-900 hover:bg-gray-100 transition-colors rounded-lg py-2.5 text-sm font-semibold mt-2"
          >
            Criar conta
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5">
          sua conta começa com uma cota padrão de 5GB
        </p>
      </div>
    </div>
  );
}