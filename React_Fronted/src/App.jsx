import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import FlatsPage from "./pages/Flats";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import Notices from "./pages/Notices";
import Complaints from "./pages/Complaints";
import MyBookings from "./pages/MyBookings";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageFlats from "./pages/admin/ManageFlats";
import ManageBookings from "./pages/admin/ManageBookings";
import ContactMessages from "./pages/admin/ContactMessages";
import ManageNotices from "./pages/admin/ManageNotices";
import ManageComplaints from "./pages/admin/ManageComplaints";
import AdminLayout from "./components/AdminLayout";
import AdminProtect from "./components/AdminProtect";
import Chatbot from "./components/Chatbot";

function ChatbotWrapper() {
  const location = useLocation();
  const hidePaths = ["/login", "/register", "/admin/login"];
  // Hide on auth pages and admin dashboard
  if (hidePaths.includes(location.pathname) || location.pathname.startsWith("/admin")) {
    return null;
  }
  return <Chatbot />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/flats" element={<FlatsPage />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtect>
              <AdminLayout />
            </AdminProtect>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="flats" element={<ManageFlats />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="notices" element={<ManageNotices />} />
          <Route path="complaints" element={<ManageComplaints />} />
          <Route path="contacts" element={<ContactMessages />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatbotWrapper />
    </BrowserRouter>
  );
}

export default App;
