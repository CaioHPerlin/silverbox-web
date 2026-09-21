import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
/*import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";*/
import Home from "./pages/Home";
import Arquivos from "./pages/Arquivos";
import Login from "./pages/Login";
import Lixeira from "./pages/Lixeira";
import RecuperarAcesso from "./pages/RecuperarAcesso";
import Perfil from "./pages/Perfil";
import NovaSenha from "./pages/NovaSenha";
import Cadastro from "./pages/Cadastro";
import Compartilhados from "./pages/Compartilhados";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-acesso" element={<RecuperarAcesso />} />
        <Route path="/nova-senha" element={<NovaSenha />} />

        {/* rotas protegidas: só acessa se tiver token salvo, senão volta pro login */}
        {/* <Route element={<ProtectedRoute />}>*/}
        <Route path="/" element={<Home />} />
        <Route path="/arquivos" element={<Arquivos />} />
        <Route path="/lixeira" element={<Lixeira />} />
        <Route path="/compartilhados" element={<Compartilhados />} />
        <Route path="/perfil" element={<Perfil />} />
        {/*  </Route>*/}

        {/* qualquer rota que não existe */}
        {/*  <Route path="*" element={<NotFound />} />*/}
      </Routes>
    </BrowserRouter>
  );
}
