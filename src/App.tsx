import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Arquivos from "./pages/Arquivos";
import Login from "./pages/Login";
import Lixeira from "./pages/Lixeira";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
  
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/arquivos" element={<Arquivos />} />
        <Route path="/lixeira" element={<Lixeira />} />
      </Routes>
    </BrowserRouter>
  );
}
