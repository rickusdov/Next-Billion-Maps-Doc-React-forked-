import React, { useEffect, useRef, useState } from 'react'
import '@nbai/nbmap-gl/dist/nextbillion.css'
import nextbillion, {
  DirectionsService,
  NBMap,
  Popup,
  Marker,
  utils
} from '@nbai/nbmap-gl'
import './DirectionsComplex.css'

function initSource(nbmap) {
  nbmap.map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    }
  })
}

function initLayer(nbmap) {
  nbmap.map.addLayer({
    id: 'route-outfit',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#c6e4ff',
      'line-width': 14
    }
  })
  nbmap.map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#8D5A9E',
      'line-width': 8
    }
  })
}

function updateResult(nbmap, routeData) {
  const source = nbmap.map.getSource('route')
  console.log(routeData)
  const data = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: utils.polyline
        .decode(routeData.geometry, 6)
        .map((c) => c.reverse())
    }
  }
  source.setData(data)
  const popupLngLat =
    data.geometry.coordinates[Math.floor(data.geometry.coordinates.length / 2)]
  const popup = new Popup({
    className: 'custom-popup',
    closeButton: false,
    closeOnClick: false
  })
  popup
    .setLngLat(popupLngLat)
    .setHTML(
      `<div>
      <p>distance: ${(routeData.distance / 1000).toFixed(2)} Km</p>
      <p>duration: ${(routeData.duration / 60).toFixed(2)} Mins</p>
    </div>`
    )
    .addTo(nbmap.map)
  return { popup }
}

const DirectionsComplex = () => {
  const nbmap = useRef(null)
  const popup = useRef(null)
  const isInited = useRef(false)
  const directionsService = useRef(new DirectionsService())
  const [origin, setOrigin] = useState({ lat: 34.0572, lng: -118.024569 })
  const [destination, setDestination] = useState({
    lat: 34.2572,
    lng: -118.424569
  })
  function requestDirection() {
    directionsService.current
      .route({
        origin: origin,
        alternatives: true,
        destination: destination
      })
      .then((response) => {
        const res = updateResult(nbmap.current, response.routes[0])
        popup.current = res.popup
      })
  }
  useEffect(() => {
    if (nbmap.current) {
      return
    }
    nextbillion.setApiKey('db20c37e79d4420f9b2f71a766cacb91')
    nbmap.current = new NBMap({
      container: 'map',
      style: 'https://api.nextbillion.io/maps/streets/style.json',
      zoom: 9,
      center: { lat: 34.08572, lng: -118.324569 }
    })
    // add the custom style layer to the map
    nbmap.current.on('load', function () {
      initSource(nbmap.current)
      initLayer(nbmap.current)
      isInited.current = true
      const originElement = document.createElement('div')
      originElement.className = 'origin-marker'
      const originMarker = new Marker({
        draggable: true,
        element: originElement
      })
        .setLngLat(origin)
        .on('dragend', (e) => {
          const newOrigin = e.target.getLngLat()
          setOrigin(newOrigin)
        })
        .addTo(nbmap.current.map)
      const destinationMarker = new Marker({
        draggable: true,
        color: '#ea4335'
      })
        .setLngLat(destination)
        .on('dragend', (e) => {
          const newDest = e.target.getLngLat()
          setDestination(newDest)
        })
        .addTo(nbmap.current.map)
      requestDirection()
    })
  })
  useEffect(() => {
    if (nbmap.current && isInited.current) {
      if (popup.current) {
        popup.current.remove()
        popup.current = null
      }
      requestDirection()
    }
  }, [origin, destination])
  return (
    <div className="app">
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: '0',
          left: '0'
        }}
        id="map"></div>
    </div>
  )
}

export default DirectionsComplex
