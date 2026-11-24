import { useForm, useWatch } from "react-hook-form";
import Sidebar from "../components/Sidebar";
import { useSession } from "../lib/authClient";
import { useEffect, useState } from "react";
import { FileActionsMenu } from "../components/FileActionsMenu";
import { ShareModal } from "../components/ShareModal";
import { RenameModal } from "../components/RenameModal";
import { FolderPickerModal } from "../components/FolderPickerModal";
import LoadingSkeleton from "../components/LoadingSkeleton";
import {
  listarArquivos,
  urlDownload,
  renomearArquivo,
  moverArquivo,
  moverParaLixeira,
  type ArquivoApi,
} from "../services/files";
import { buscarAvatar } from "../services/avatar";
import { useNavigate } from "react-router-dom";
import { useBusca } from "../hooks/useBusca";
import { textoDoLocal, type ItemBusca } from "../services/search";
import { listarPastas } from "../services/folders";

type ItemType = "pdf" | "image" | "doc" | "sheet" | "zip" | "other";

interface RecentItem {
  id: number;
  name: string;
  type: ItemType;
  date: string;
}

interface SearchForm {
  query: string;
}

type SelectedFile = {
  id: string;
  name: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ---- Ícone por tipo (SVG inline, sem dependência externa) ----
function ItemIcon({ type }: { type: ItemType }) {
  const color =
    type === "pdf"
      ? "text-red-400"
      : type === "image"
        ? "text-purple-400"
        : type === "sheet"
          ? "text-green-400"
          : "text-gray-400";

  return (
    <svg
      className={`w-8 h-8 ${color}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function tipoDoArquivo(nome: string, mime: string | null): ItemType {
  const ext = nome.split(".").pop()?.toLowerCase() ?? "";

  if (mime?.startsWith("image/")) return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (["doc", "docx", "odt", "txt", "rtf"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) return "sheet";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "zip";

  return "other";
}

// Função para verificar hora para Bom dia, Boa tarde e Boa noite
function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

async function listarArquivosDeTodasAsPastas(
  folderId: number | null = null,
): Promise<ArquivoApi[]> {
  const primeiraPagina = await listarArquivos(folderId, 1, 100);

  const arquivos = [...primeiraPagina.files];
  const totalPaginas = Math.ceil(primeiraPagina.total / 100);

  for (let pagina = 2; pagina <= totalPaginas; pagina++) {
    const resposta = await listarArquivos(folderId, pagina, 100);
    arquivos.push(...resposta.files);
  }

  const pastas = await listarPastas(folderId);

  for (const pasta of pastas) {
    const arquivosDaSubpasta = await listarArquivosDeTodasAsPastas(pasta.id);

    arquivos.push(...arquivosDaSubpasta);
  }

  return arquivos;
}

export default function Home() {
  const { data: session, isPending } = useSession();

  const [arquivos, setArquivos] = useState<ArquivoApi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [sharingFile, setSharingFile] = useState<SelectedFile | null>(null);
  const [renamingFile, setRenamingFile] = useState<SelectedFile | null>(null);
  const [movingFile, setMovingFile] = useState<SelectedFile | null>(null);

  //Avatar - foto de perfil
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { register, control } = useForm<SearchForm>({
    defaultValues: { query: "" },
  });

  const valorPesquisa = useWatch({
    control,
    name: "query",
  });

  const pesquisa = (valorPesquisa ?? "").trim().toLowerCase();
  const navigate = useNavigate();

  const busca = useBusca((valorPesquisa ?? "").trim(), "all", null);

  // Carrega a foto de perfil
  useEffect(() => {
    let cancelado = false;
    let url: string | null = null;

    async function carregarFoto() {
      try {
        const imagem = await buscarAvatar();

        if (!imagem || cancelado) return;

        url = URL.createObjectURL(imagem);
        setAvatarUrl(url);
      } catch {
        if (!cancelado) {
          setAvatarUrl(null);
        }
      }
    }

    carregarFoto();

    return () => {
      cancelado = true;

      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  useEffect(() => {
    async function carregarArquivos() {
      try {
        const todosArquivos = await listarArquivosDeTodasAsPastas();

        setArquivos(todosArquivos);
      } catch {
        setErro("Não foi possível carregar seus arquivos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarArquivos();
  }, []);

  function handleBaixar(id: string) {
    window.location.assign(urlDownload(Number(id)));
  }

  async function handleExcluir(id: string) {
    try {
      await moverParaLixeira(Number(id));

      setArquivos((atuais) =>
        atuais.filter((arquivo) => arquivo.id !== Number(id)),
      );
    } catch {
      setErro("Não foi possível excluir o arquivo.");
    }
  }

  async function handleRenomear(id: string, newName: string) {
    try {
      await renomearArquivo(Number(id), newName);

      setArquivos((atuais) =>
        atuais.map((arquivo) =>
          arquivo.id === Number(id)
            ? { ...arquivo, originalName: newName }
            : arquivo,
        ),
      );

      setRenamingFile(null);
    } catch {
      setErro("Não foi possível renomear o arquivo.");
    }
  }

  async function handleMover(id: string, folderId: number | null) {
    try {
      await moverArquivo(Number(id), folderId);

      const todosArquivos = await listarArquivosDeTodasAsPastas();
      setArquivos(todosArquivos);

      setMovingFile(null);
    } catch {
      setErro("Não foi possível mover o arquivo.");
    }
  }

  function abrirResultado(item: ItemBusca) {
    const caminho =
      item.kind === "folder"
        ? [...item.path, { id: item.id, name: item.name }]
        : item.path;

    navigate("/arquivos", {
      state: {
        searchPath: caminho,
      },
    });
  }

  if (isPending) return <LoadingSkeleton mensagem="Preparando sua nuvem..." />;

  if (!session)
    return <p className="p-8 text-gray-400">Sessão não encontrada.</p>;

  const userName = session.user.name;

  //Ordena arquivos do mais ao menos recente a partir da data de criação e não de alteração ainda
  const itensRecentes: RecentItem[] = arquivos
    .filter((arquivo) => !arquivo.isDeleted)
    .map((arquivo) => ({
      id: arquivo.id,
      name: arquivo.originalName,
      type: tipoDoArquivo(arquivo.originalName, arquivo.mimeType),
      date: arquivo.createdAt,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  //Ordena os arquivos por data para serem exibidos
  function agruparPorData(itens: RecentItem[]) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicioSemana = new Date(hoje);
    const diaSemana = inicioSemana.getDay();
    inicioSemana.setDate(
      inicioSemana.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1),
    );

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);

    const grupos: Record<string, RecentItem[]> = {
      Hoje: [],
      "Esta semana": [],
      "Este mês": [],
      "Este ano": [],
      "Anos anteriores": [],
    };

    itens.forEach((item) => {
      const data = new Date(item.date);

      if (isNaN(data.getTime())) return;

      if (data >= hoje) {
        grupos["Hoje"].push(item);
      } else if (data >= inicioSemana) {
        grupos["Esta semana"].push(item);
      } else if (data >= inicioMes) {
        grupos["Este mês"].push(item);
      } else if (data >= inicioAno) {
        grupos["Este ano"].push(item);
      } else {
        grupos["Anos anteriores"].push(item);
      }
    });

    return grupos;
  }

  const arquivosFiltrados = itensRecentes.filter((item) =>
    item.name.toLowerCase().includes(pesquisa),
  );

  const gruposRecentes = agruparPorData(arquivosFiltrados);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0d0d0d] text-white md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {/* Busca + avatar */}
        <form
          className="flex items-center gap-3 mb-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              {...register("query")}
              placeholder="Buscar no Silverbox"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-3 py-2.5 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-500/20 text-sm font-semibold text-blue-400">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(userName)
            )}
          </div>
        </form>

        {/* Saudação */}
        <h1 className="text-xl font-semibold mb-1">
          {greeting()}, {userName}!
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          {busca.ativa ? "Resultados da pesquisa" : "Acessados recentemente"}
        </p>

        {/* Resultados da busca no servidor */}
        {busca.ativa ? (
          busca.carregando ? (
            <LoadingSkeleton mensagem="Buscando seus arquivos..." />
          ) : busca.erro ? (
            <p className="text-sm text-red-400">{busca.erro}</p>
          ) : busca.total === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum arquivo ou pasta encontrado.
            </p>
          ) : (
            <>
              <p className="mb-4 text-xs text-gray-500">
                {busca.total} resultado(s) encontrado(s)
              </p>

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {busca.itens.map((item) => (
                  <button
                    key={`${item.kind}-${item.id}`}
                    type="button"
                    onClick={() => abrirResultado(item)}
                    className="flex w-full min-w-0 flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-blue-500/40 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center gap-3">
                      {item.kind === "folder" ? (
                        <svg
                          className="h-8 w-8 shrink-0 text-yellow-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                          />
                        </svg>
                      ) : (
                        <ItemIcon
                          type={tipoDoArquivo(item.name, item.mimeType)}
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {textoDoLocal(item.path)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500">
                        {item.kind === "folder" ? "Pasta" : "Arquivo"}
                      </span>

                      <span className="text-xs text-blue-400">Abrir →</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Paginação da busca */}
              {busca.totalPaginas > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    disabled={busca.pagina <= 1}
                    onClick={() => busca.setPagina(busca.pagina - 1)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Anterior
                  </button>

                  <span className="text-sm text-gray-400">
                    Página {busca.pagina} de {busca.totalPaginas}
                  </span>

                  <button
                    type="button"
                    disabled={busca.pagina >= busca.totalPaginas}
                    onClick={() => busca.setPagina(busca.pagina + 1)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )
        ) : /* Arquivos recentes: comportamento original */
        carregando ? (
          <LoadingSkeleton mensagem="Carregando seus arquivos..." />
        ) : erro ? (
          <p className="text-sm text-red-400">{erro}</p>
        ) : itensRecentes.length === 0 ? (
          <p className="text-sm text-gray-500">
            Você ainda não possui arquivos.
          </p>
        ) : arquivosFiltrados.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum arquivo encontrado para essa pesquisa.
          </p>
        ) : (
          Object.entries(gruposRecentes).map(
            ([titulo, itens]) =>
              itens.length > 0 && (
                <section key={titulo} className="mb-8">
                  <h2 className="mb-4 text-sm font-semibold text-gray-300">
                    {titulo}
                  </h2>

                  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {itens.map((item) => {
                      const arquivoSelecionado = {
                        id: String(item.id),
                        name: item.name,
                      };

                      return (
                        <article
                          key={item.id}
                          className="flex w-full min-w-0 flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20"
                        >
                          <div className="flex w-full items-start justify-between gap-3">
                            <ItemIcon type={item.type} />

                            <FileActionsMenu
                              onShare={() => setSharingFile(arquivoSelecionado)}
                              onRename={() =>
                                setRenamingFile(arquivoSelecionado)
                              }
                              onDownload={() =>
                                handleBaixar(arquivoSelecionado.id)
                              }
                              onMove={() => setMovingFile(arquivoSelecionado)}
                              onDelete={() =>
                                handleExcluir(arquivoSelecionado.id)
                              }
                            />
                          </div>

                          <div className="w-full min-w-0">
                            <p className="truncate text-sm font-medium">
                              {item.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {new Date(item.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ),
          )
        )}
        {/* Modais das ações dos arquivos */}
        <ShareModal file={sharingFile} onClose={() => setSharingFile(null)} />

        <RenameModal
          file={renamingFile}
          onClose={() => setRenamingFile(null)}
          onRenamed={(id, newName) => handleRenomear(id, newName)}
        />

        <FolderPickerModal
          aberto={movingFile !== null}
          titulo="Mover arquivo para..."
          onClose={() => setMovingFile(null)}
          onConfirm={(destino) => {
            if (movingFile) {
              handleMover(movingFile.id, destino);
            }
          }}
        />
      </main>
    </div>
  );
}
