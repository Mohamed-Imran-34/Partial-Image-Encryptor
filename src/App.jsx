import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UploadPage from "./pages/UploadPage";
import DecryptPage from "./pages/DecryptPage";

export default function App() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #43cea2, #185a9d)",
      color: "#fff",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
      transition: "all 0.5s ease"
    }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/decrypt" element={<DecryptPage />} />
        </Routes>
      </Router>
    </div>
  );
}
