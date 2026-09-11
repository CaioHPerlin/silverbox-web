import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Arquivos from "./pages/Arquivos";
import Login from "./pages/Login";
import Lixeira from "./pages/Lixeira";

import RecuperarAcesso from "./pages/RecuperarAcesso";
import Perfil from "./pages/Perfil";
import NovaSenha from "./pages/NovaSenha";
import Cadastro from "./pages/Cadastro";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-acesso" element={<RecuperarAcesso />} />
        <Route path="/nova-senha" element={<NovaSenha />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/arquivos" element={<Arquivos />} />
        <Route path="/lixeira" element={<Lixeira />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </BrowserRouter>
  );
}
