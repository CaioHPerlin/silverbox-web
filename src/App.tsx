import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Arquivos from "./pages/Arquivos";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* home real: tela inicial estilo Google Drive */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* listagem completa de arquivos */}
        <Route path="/arquivos" element={<Arquivos />} />
      </Routes>
    </BrowserRouter>
  );
}
