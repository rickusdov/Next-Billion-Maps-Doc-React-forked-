import React, { useEffect, useRef, useState } from 'react'
import '@nbai/nbmap-gl/dist/nextbillion.css'
import nextbillion, { NavigationService, Marker, utils } from '@nbai/nbmap-gl'
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

function emptyFeatureCollection() {
  return {
    type: 'FeatureCollection',
    features: []
  }
}

function emptyLineString() {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: []
    },
    properties: {}
  }
}

function emptyPoint() {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: []
    },
    properties: {}
  }
}

function generateNavigationFeature(payload) {
  const routeCollection = emptyFeatureCollection()
  payload.routes.forEach((route, index) => {
    const lineString = emptyLineString()
    // add route source
    lineString.geometry.coordinates = utils.polyline
      .decode(route.geometry, 6)
      .map((c) => c.reverse())
    lineString.properties = {
      distance: route.distance,
      duration: route.duration,
      type: 'route',
      index
    }
    routeCollection.features.push(lineString)
    // add maneuver source
    route.legs[0].steps.forEach((step, index) => {
      const arrowPoint = emptyPoint()
      const lineString = emptyLineString()
      const maneuverCorrdinates = []
      lineString.geometry.coordinates = maneuverCorrdinates
      lineString.properties = {
        distance: step.distance.value,
        duration: step.duration.value,
        type: 'stepRoute',
        index
      }
      routeCollection.features.push(lineString)
      const maneuverPoint = emptyPoint()
      maneuverPoint.geometry.coordinates = [
        step.maneuver.coordinate.longitude,
        step.maneuver.coordinate.latitude
      ]
      maneuverPoint.properties = {
        type: 'maneuver',
        detail: step.maneuver,
        instruction: step.maneuver.instruction,
        index
      }
      routeCollection.features.push(maneuverPoint)
      routeCollection.features.push(arrowPoint)
    })
  })

  return routeCollection
}

function initLayer(nbmap) {
  // render the route
  nbmap.map.addLayer({
    id: 'navigation-route-line',
    type: 'line',
    source: 'route',
    filter: ['==', ['get', 'type'], 'route'],
    layout: {
      'line-cap': 'butt',
      'line-join': 'round',
      visibility: 'visible'
    },
    paint: {
      'line-color': 'rgba(66, 63, 189, 0.5)',
      'line-width': 10
    }
  })
  // render the maneuver points
  nbmap.map.addLayer({
    id: 'maneuver-points',
    type: 'circle',
    filter: ['==', ['get', 'type'], 'maneuver'],
    source: 'route',
    paint: {
      'circle-color': '#3853B1',
      'circle-radius': 10
    }
  })
  // show maneuver instruction around the maneuver point
  nbmap.map.addLayer({
    id: 'maneuver-instruction',
    type: 'symbol',
    filter: ['==', ['get', 'type'], 'maneuver'],
    source: 'route',
    layout: {
      'text-field': ['get', 'instruction'],
      'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
      'text-radial-offset': 0.5,
      'text-justify': 'auto'
    }
  })
}

function updateResult(nbmap, payload) {
  const source = nbmap.map.getSource('route')
  const data = generateNavigationFeature(payload)
  source.setData(data)
}

const Navigation = () => {
  const nbmap = useRef(null)
  const popup = useRef(null)
  const isInited = useRef(false)
  const navigationService = useRef(new NavigationService())
  const [origin, setOrigin] = useState({ lat: 34.0572, lng: -118.024569 })
  const [destination, setDestination] = useState({
    lat: 34.2572,
    lng: -118.424569
  })
  function requestNavigation() {
    navigationService.current
      .route({
        origin: origin,
        destination: destination
      })
      .then((response) => {
        updateResult(nbmap.current, response)
      })
  }
  useEffect(() => {
    if (nbmap.current) {
      return
    }
    nextbillion.setApiKey('db20c37e79d4420f9b2f71a766cacb91')
    nbmap.current = new nextbillion.maps.Map({
      container: 'map',
      style: 'https://api.nextbillion.io/maps/streets/style.json',
      zoom: 10,
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
      requestNavigation()
    })
  })
  useEffect(() => {
    if (nbmap.current && isInited.current) {
      if (popup.current) {
        popup.current.remove()
        popup.current = null
      }
      requestNavigation()
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

export default Navigation
