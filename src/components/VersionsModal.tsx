import { useCallback, useEffect, useRef, useState } from "react";
import { formatBytes } from "../lib/format";
import { mensagemDeErro } from "../services/files";
import {
  enviarVersao, listarVersoes, restaurarVersao, urlDownloadVersao, type VersaoApi,
} from "../services/versions";

interface Props {
  arquivo: { id: number; name: string } | null; // null = fechado
  onClose: () => void;
}

export function VersionsModal({ arquivo, onClose }: Props) {
  const [versoes, setVersoes] = useState<VersaoApi[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    if (!arquivo) return;
    setCarregando(true);
    try {
      setVersoes(await listarVersoes(arquivo.id));
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, [arquivo]);

  useEffect(() => { carregar(); }, [carregar]);

  if (!arquivo) return null;

  async function acao(fn: () => Promise<unknown>) {
    setOcupado(true);
    setErro(null);
    try {
      await fn();
      await carregar();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setOcupado(false);
    }
  }

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f && arquivo) acao(() => enviarVersao(arquivo.id, f));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-white/10 bg-[#161616] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Versões</h2>
            <p className="truncate text-sm text-gray-500">{arquivo.name}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-gray-500 hover:text-white">
            ✕
          </button>
        </div>

        {erro && (
          <div role="alert" className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {erro}
          </div>
        )}

        <div className="mb-4 max-h-72 overflow-y-auto rounded-lg border border-white/10">
          {carregando ? (
            <p className="px-3 py-6 text-center text-sm text-gray-500">Carregando...</p>
          ) : (
            versoes.map((v, i) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2.5 text-sm last:border-b-0"
              >
                <div className="min-w-0">
                  <p>
                    Versão {v.versionNumber}
                    {i === 0 && (
                      <span className="ml-2 rounded bg-blue-500/20 px-1.5 py-0.5 text-xs text-blue-300">
                        atual
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(v.sizeBytes)} · {new Date(v.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3 text-xs">
                  <a
                    href={urlDownloadVersao(arquivo.id, v.id)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Baixar
                  </a>
                  {i !== 0 && (
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() => acao(() => restaurarVersao(arquivo.id, v.id))}
                      className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    >
                      Restaurar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <input ref={inputRef} type="file" hidden onChange={handleArquivo} />
        <button
          type="button"
          disabled={ocupado}
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {ocupado ? "Aguarde..." : "Enviar nova versão"}
        </button>
        <p className="mt-2 text-xs text-gray-500">
          As versões antigas também ocupam espaço na cota.
        </p>
      </div>
    </div>
  );
}