import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HireAtlasAuth from "./components/LoginSignup"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<HireAtlasAuth />} />
        {/* Redirect root to auth for now */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  )
}