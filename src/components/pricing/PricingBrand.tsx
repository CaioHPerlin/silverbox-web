import { Link } from "react-router-dom";

export default function PricingBrand() {
  return (
    <Link to="/planos" className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-white" aria-label="Silverbox, planos">
      <img src="/minha-nuvem-logo.png" alt="" className="h-8 w-9 object-contain" />
      <span>Silverbox</span>
    </Link>
  );
}
