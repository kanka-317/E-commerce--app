/* eslint-disable react-refresh/only-export-components */
import React, { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Add from "./pages/add";
import List from "./pages/list";
import Orders from "./pages/orders";
import Login from "./components/Login";

 export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const updateToken = (value) => {
    setToken(value);

    if (value) {
      localStorage.setItem("token", value);
    } else {
      localStorage.removeItem("token");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {token === "" ? (
        <Login setToken={updateToken} />
      ) : (
        <>
          <Navbar setToken={updateToken} />
          <div className="flex w-full">
            <Sidebar />
            <main className="flex-1 p-5 sm:p-8">
              <Routes>
                <Route path="/" element={<Navigate to="/list" replace />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
              </Routes>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
