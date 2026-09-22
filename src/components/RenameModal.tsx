import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "./Modal";

interface RenameModalProps {
  file: { id: string; name: string } | null;
  onClose: () => void;
  onRenamed?: (fileId: string, newName: string) => void;
}

interface RenameFormData {
  name: string;
}

export function RenameModal({ file, onClose, onRenamed }: RenameModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RenameFormData>();

  // toda vez que abrir o modal para um arquivo novo, preenche o campo com o nome atual
  useEffect(() => {
    if (file) reset({ name: file.name });
  }, [file, reset]);

  async function onSubmit(data: RenameFormData) {
    if (!file) return;

    // TODO: substituir por chamada real à API — algo como:
    // await apiClient.put(`/files/${file.id}`, { name: data.name });
    console.log("renomeado (placeholder):", file.id, "->", data.name);

    onRenamed?.(file.id, data.name);
    onClose();
  }

  const isOpen = file !== null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[340px] rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
        <h2 className="mb-4 text-base font-semibold text-white">
          Renomear arquivo
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <input
            autoFocus
            className="mb-1 w-full rounded-lg border border-zinc-600 bg-transparent px-3 py-2 text-sm text-zinc-100 focus:border-[#5C93E6] focus:outline-none focus:ring-1 focus:ring-[#5C93E6]"
            {...register("name", {
              required: "O nome não pode ficar vazio.",
              maxLength: { value: 120, message: "Nome muito longo." },
            })}
          />
          {errors.name && (
            <p className="mb-2 text-xs text-red-400">{errors.name.message}</p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
