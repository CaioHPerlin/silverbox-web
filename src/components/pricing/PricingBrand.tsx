import { Link } from "react-router-dom";

export default function PricingBrand() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-white"
      aria-label="Silverbox, página inicial"
    >
      <img
        src="/minha-nuvem-logo.png"
        alt=""
        className="h-10 w-42 object-contain"
      />
    </Link>
  );
}
