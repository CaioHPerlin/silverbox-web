import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Planos from "./pages/Planos";
import Home from "./pages/Home";
import Arquivos from "./pages/Arquivos";
import Login from "./pages/Login";
import Lixeira from "./pages/Lixeira";
import RecuperarAcesso from "./pages/RecuperarAcesso";
import Perfil from "./pages/Perfil";
import NovaSenha from "./pages/NovaSenha";
import Cadastro from "./pages/Cadastro";
import Compartilhados from "./pages/Compartilhados";
import AdminDashboard from "./pages/Admin/DashboardAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import ArquivosAdmin from "./pages/Admin/ArquivosAdmin";
import UsuariosAdmin from "./pages/Admin/UsuariosAdmin";
import AuditoriaAdmin from "./pages/Admin/AuditoriaAdmin";
import SistemaAdmin from "./pages/Admin/SistemaAdmin";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* rotas públicas */}
        <Route path="/planos" element={<Planos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-acesso" element={<RecuperarAcesso />} />
        <Route path="/nova-senha" element={<NovaSenha />} />
        {/* Rotas protegidas pela sessão do Better Auth. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/arquivos" element={<Arquivos />} />
          <Route path="/lixeira" element={<Lixeira />} />
          <Route path="/compartilhados" element={<Compartilhados />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
        {/**Rotas de Administrador */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/arquivos" element={<ArquivosAdmin />} />
          <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
          <Route path="/admin/auditoria" element={<AuditoriaAdmin />} />
          <Route path="/admin/sistema" element={<SistemaAdmin />} />
        </Route>
        {/* qualquer rota que não existe */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
