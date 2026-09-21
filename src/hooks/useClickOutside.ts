import { useEffect, type RefObject } from "react";

/**
 * Chama `onOutsideClick` quando o usuário clica fora do elemento referenciado por `ref`.
 * Usado pra fechar dropdowns, menus de contexto e modais simples.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutsideClick: () => void,
  isActive: boolean = true,
) {
  useEffect(() => {
    if (!isActive) return;

    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, onOutsideClick, isActive]);
}
