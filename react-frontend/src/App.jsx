import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import AdminDashboard from "./sidebar/AdminDashboard";
import Organization from "./sidebar/Organization";
import Project from "./sidebar/Project";
import AcceptInvitePage from "./utils/Organization-accept";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Project/>} />
          <Route path="organization" element={<Organization/>} />
          <Route path="iam" element={<Organization/>} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="organization-accept/:orgId" element={<AcceptInvitePage />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App; 
