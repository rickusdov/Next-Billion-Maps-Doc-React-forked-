import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Marker from './pages/Marker'
import Popup from './pages/Popup'
import Directions from './pages/Directions'
import DirectionsComplex from './pages/DirectionsComplex'
import DistanceMatrix from './pages/DistanceMatrix'
import SnapToRoads from './pages/SnapToRoad'
import ShapeAndSymbol from './pages/ShapeAndSymbol'
import Simple from './pages/InitMap'
import Autosuggest from './api-pages/Autosuggest'
import Navigation from './pages/Navigation'
import OptimizationMVRP from './pages/OptimizationMVRP'
import MapWithControls from './pages/MapWIthControls'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DirectionsComplex />} />
        <Route path="init-map" element={<Simple />} />
        <Route path="marker" element={<Marker />} />
        <Route path="popup" element={<Popup />} />
        <Route path="directions" element={<Directions />} />
        <Route path="shapeAndSymbol" element={<ShapeAndSymbol />} />
        <Route path="directions-complex" element={<DirectionsComplex />} />
        <Route path="distance-matrix" element={<DistanceMatrix />} />
        <Route path="snap-to-roads" element={<SnapToRoads />} />
        <Route path="api-pages/autosuggest" element={<Autosuggest />} />
        <Route path="navigation" element={<Navigation />} />
        <Route path="optimization-mvrp" element={<OptimizationMVRP />} />
        <Route path="map-with-controls" element={<MapWithControls />} />
      </Routes>
    </BrowserRouter>
    ,
  </StrictMode>
)
