import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* rota inicial redireciona direto para a home */}
        <Route path="/" element={<Navigate to="/arquivos" replace />} />

        <Route path="/arquivos" element={<Home />} />

        {/* rota curinga: qualquer caminho não encontrado volta para a home */}
        <Route path="*" element={<Navigate to="/arquivos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}