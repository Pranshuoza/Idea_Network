import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/Authentication/Login";
import RegisterPage from "./Pages/Authentication/Register";
// import Landing from "./Pages/Landing";
// import Dashboard from "./Pages/Dashboard";
// import Idea from "./Pages/Idea";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;
