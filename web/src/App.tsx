import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Verify from './pages/Verify'
import Docs from './pages/Docs'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify/:id" element={<Verify />} />
        <Route path="/docs" element={<Docs />} />
      </Routes>
    </BrowserRouter>
  )
}
