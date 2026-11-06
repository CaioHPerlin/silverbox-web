export const EVENTO_COTA = "cota:mudou";

export function avisarCotaMudou() {
  window.dispatchEvent(new Event(EVENTO_COTA));
}