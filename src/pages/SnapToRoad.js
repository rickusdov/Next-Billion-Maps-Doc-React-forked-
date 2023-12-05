import React, { useEffect, useRef, useState } from 'react'
import '@nbai/nbmap-gl/dist/nextbillion.css'
import nextbillion, {
  SnapToRoadsService,
  AvoidType,
  TravelMode,
  ApproachType,
  Marker,
  NBRequestStatus,
  utils
} from '@nbai/nbmap-gl'
import './SnapToRoad.css'

function initSource(nbmap) {
  nbmap.map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })
  nbmap.map.addSource('snapped-points', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
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
  nbmap.map.addLayer({
    id: 'snapped-points',
    source: 'snapped-points',
    type: 'circle',
    paint: {
      'circle-color': '#fff',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#3853B1',
      'circle-radius': 6
    }
  })
}

const SnapToRoadsDemo = () => {
  const nbmap = useRef(null)
  const popup = useRef(null)
  const isInited = useRef(false)
  const snapToRoadsService = useRef(new SnapToRoadsService())
  const points = useRef([])
  const [snappedPoints, setSnappedPoints] = useState([])
  const [geometry, setGeometry] = useState([])
  function requestSnapToRoads() {
    snapToRoadsService.current
      .getSnapToRoads({
        path: points.current.map((item) => item.lngLat),
        avoid: AvoidType.HIGHWAY,
        mode: TravelMode.DRIVING,
        interpolate: true,
        approaches: new Array(points.current.length).fill(ApproachType.CURB),
        radiuses: new Array(points.current.length).fill(25),
        timestamps: [
          Math.round(+new Date() / 1000) + 1,
          Math.round(+new Date() / 1000) + 100
        ],
        // geometry: GeometryType.GEOJSON,
        tolerateOutlier: true
      })
      .then((response) => {
        if (response.status !== NBRequestStatus.OK) {
          console.log(response)
          return
        }
        clearPoints()
        setGeometry(response.geometry)
        setSnappedPoints(response.snappedPoints)
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
      center: { lat: 1.29, lng: 103.85 }
    })
    // add the custom style layer to the map
    nbmap.current.on('load', function () {
      initSource(nbmap.current)
      initLayer(nbmap.current)
      isInited.current = true
      nbmap.current.on('click', (e) => {
        console.log(e)
        const index = points.current.length + 1
        const pointElement = document.createElement('div')
        pointElement.className = 'point-marker'
        pointElement.innerHTML = `P${index}`
        const newMarker = new Marker({
          element: pointElement
        })
          .setLngLat(e.lngLat)
          .addTo(nbmap.current.map)
        points.current = [
          ...points.current,
          {
            marker: newMarker,
            lngLat: e.lngLat
          }
        ]
      })
    })
  }, [])
  useEffect(() => {
    if (!isInited.current) {
      return
    }
    const source = nbmap.current.map.getSource('route')
    const data = {
      type: 'FeatureCollection',
      features: []
    }
    geometry.forEach((g) => {
      data.features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: utils.polyline.decode(g).map((c) => c.reverse())
        }
      })
    })
    source.setData(data)
    const pointsData = {
      type: 'FeatureCollection',
      features: []
    }
    const pointsSource = nbmap.current.map.getSource('snapped-points')
    snappedPoints.forEach((p) => {
      pointsData.features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [p.location.longitude, p.location.latitude]
        }
      })
    })
    pointsSource.setData(pointsData)
  }, [geometry, snappedPoints])
  function onRequest() {
    if (nbmap.current && isInited.current) {
      if (popup.current) {
        popup.current.remove()
        popup.current = null
      }
      requestSnapToRoads()
    }
  }
  function clearPoints() {
    points.current.forEach((p) => {
      p.marker.remove()
    })
    points.current = []
  }
  function onClear() {
    clearPoints()
    points.current = []
    setGeometry([])
    setSnappedPoints([])
  }
  return (
    <div className="app snap-to-roads">
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: '0',
          left: '0'
        }}
        id="map"></div>
      <div className="hint">
        <div>Click to add point</div>
        <div>
          <button className="clear" onClick={onClear}>
            Clear points
          </button>
          <button onClick={onRequest} className="clear">
            Request
          </button>
        </div>
      </div>
    </div>
  )
}

export default SnapToRoadsDemo
