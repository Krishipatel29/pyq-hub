import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import { RequireAuth } from "./components/Common";
import Home from "./pages/Home";
import { Login, Register } from "./pages/Auth";
import SubjectPage from "./pages/SubjectPage";
import PaperPage from "./pages/PaperPage";
import UploadPage from "./pages/UploadPage";
import Bookmarks from "./pages/Bookmarks";
import MyUploads from "./pages/MyUploads";
import AdminPage from "./pages/AdminPage";

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">
        <span className="marker">Page not found</span>
      </h1>
      <p className="mt-3 text-pencil">This link doesn't lead anywhere. Check the address or go back to subjects.</p>
      <Link to="/" className="btn-primary mt-6">
        Browse subjects
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/subjects/:id" element={<SubjectPage />} />
          <Route path="/papers/:id" element={<PaperPage />} />
          <Route path="/upload" element={<RequireAuth><UploadPage /></RequireAuth>} />
          <Route path="/bookmarks" element={<RequireAuth><Bookmarks /></RequireAuth>} />
          <Route path="/my-uploads" element={<RequireAuth><MyUploads /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth admin><AdminPage /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-pencil sm:flex-row sm:justify-between">
          <span>PYQ Hub. Papers shared by students, checked before they go live.</span>
          <span>Built with MongoDB, Express, React and Node</span>
        </div>
      </footer>
    </div>
  );
}
