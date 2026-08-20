import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Home from './pages/Home'
import Verify from './pages/Verify'
import Docs from './pages/Docs'

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify/:id" element={<Verify />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}