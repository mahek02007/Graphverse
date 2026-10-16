import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import SocialNetwork from './pages/SocialNetwork/SocialNetwork'
import UtilitiesProblem from './pages/UtilitiesProblem/UtilitiesProblem'
import WebGraph from './pages/WebGraph/WebGraph'
import GoogleMaps from './pages/GoogleMaps/GoogleMaps'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"                index element={<Home />} />
            <Route path="/social-network"  element={<SocialNetwork />} />
            <Route path="/utilities"       element={<UtilitiesProblem />} />
            <Route path="/web-graph"       element={<WebGraph />} />
            <Route path="/google-maps"     element={<GoogleMaps />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
