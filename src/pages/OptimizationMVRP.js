import React, { useEffect, useRef, useState } from 'react'
import '@nbai/nbmap-gl/dist/nextbillion.css'
import nextbillion, {
  OptimizationMvrpService,
  Marker,
  utils
} from '@nbai/nbmap-gl'
import './OptimizationMVRP.css'

function addMarker(className, origin, map, dragedCB) {
  const htmlEle = document.createElement('div')
  htmlEle.className = `marker ${className}`
  htmlEle.innerHTML = className
  new Marker({
    draggable: true,
    element: htmlEle
  })
    .setLngLat(origin)
    .on('dragend', dragedCB)
    .addTo(map)
}

function initSource(nbmap) {
  nbmap.map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })
}

function initLayer(nbmap) {
  nbmap.map.addLayer({
    id: 'route-1',
    type: 'line',
    source: 'route',
    filter: ['==', 'i', 0],
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': 'rgba(129,43,250, 0.8)',
      'line-width': 8
    }
  })
  nbmap.map.addLayer({
    id: 'route-2',
    type: 'line',
    source: 'route',
    filter: ['==', 'i', 1],
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': 'rgba(40,149,255,0.8)',
      'line-width': 8
    }
  })
  nbmap.map.addLayer({
    id: 'route-arrow',
    type: 'symbol',
    source: 'route',
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': 50,
      'text-field': '>',
      'text-justify': 'auto',
      'text-keep-upright': false
    },
    paint: {
      'text-color': '#fff',
      'text-halo-width': 1,
      'text-halo-color': '#fff'
    }
  })
}

const OptimizationDemo = () => {
  const nbmap = useRef(null)
  const popup = useRef(null)
  const isInited = useRef(false)
  const optimizationService = useRef(new OptimizationMvrpService())
  const points = useRef([])
  const [loading, setLoading] = useState(false)
  const [orderID, setOrderID] = useState(null)
  const [geometries, setGeometries] = useState([])
  const [locations, setLocations] = useState([
    [103.81083858975057, 1.2968960090271366],
    [103.85664990853286, 1.3407903638689334],
    [103.84600055140783, 1.341046904612],
    [103.83163223266678, 1.293432355082615],
    [103.88295253757661, 1.3156492414811538],
    [103.8826959265624, 1.310261824983371],
    [103.82450276086382, 1.2862852266878093],
    [103.80455787247627, 1.287429312744976],
    [103.87782031727642, 1.331041795775164],
    [103.88795645237036, 1.3339920244098948]
  ])
  function requestOptimization() {
    console.log(locations)
    optimizationService.current
      .postVRP({
        description: 'text description',
        // set locations information
        locations: {
          id: 2,
          location: locations
        },
        // set shipments information
        shipments: [
          {
            pickup: {
              id: 1,
              location_index: 0
            },
            delivery: {
              id: 1,
              location_index: 3
            }
          },
          {
            pickup: {
              id: 2,
              location_index: 1
            },
            delivery: {
              id: 2,
              location_index: 4
            }
          },
          {
            pickup: {
              id: 3,
              location_index: 2
            },
            delivery: {
              id: 3,
              location_index: 5
            }
          }
        ],
        // set vehicles information
        vehicles: [
          {
            id: 1,
            start_index: 6,
            end_index: 7
          },
          {
            id: 2,
            start_index: 8,
            end_index: 9
          }
        ]
      })
      .then((response) => {
        if (response.status !== 'Ok') {
          console.log(response)
          return
        }
        setOrderID(response.id)
      })
  }
  function tryFetchResult() {
    if (!orderID) {
      return
    }
    setLoading(true)
    optimizationService.current
      .retrieve({
        id: orderID
      })
      .then((res) => {
        if (res.status !== 'Ok' || res.result.code !== 0) {
          // try fetch until result ready
          setTimeout(() => {
            tryFetchResult()
          }, 2000)
          return
        }
        // try render result
        console.log(res.result)
        setGeometries(res.result.routes.map((route) => route.geometry))
        setLoading(false)
      })
  }
  useEffect(() => {
    if (orderID) {
      tryFetchResult()
    }
  }, [orderID])
  useEffect(() => {
    if (nbmap.current) {
      return
    }
    nextbillion.setApiKey('db20c37e79d4420f9b2f71a766cacb91')
    nbmap.current = new nextbillion.maps.Map({
      container: 'map',
      style: 'https://api.nextbillion.io/maps/streets/style.json',
      zoom: 12,
      center: { lat: 1.29, lng: 103.85 }
    })
    // add the custom style layer to the map
    nbmap.current.on('load', function () {
      initSource(nbmap.current)
      initLayer(nbmap.current)
      isInited.current = true
      nbmap.current.on('click', (e) => {
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

      addMarker('P1', locations[0], nbmap.current.map, (e) => {
        const newOrigin = e.target.getLngLat()
        locations[0] = [newOrigin.lng, newOrigin.lat]
        setLocations(locations)
      })
      addMarker('P2', locations[1], nbmap.current.map, (e) => {
        const newOrigin = e.target.getLngLat()
        locations[1] = [newOrigin.lng, newOrigin.lat]
        setLocations(locations)
      })
      addMarker('P3', locations[2], nbmap.current.map, (e) => {
        const newOrigin = e.target.getLngLat()
        locations[2] = [newOrigin.lng, newOrigin.lat]
        setLocations(locations)
      })
      addMarker('D1', locations[3], nbmap.current.map, (e) => {
        const newOrigin = e.target.getLngLat()
        locations[3] = [newOrigin.lng, newOrigin.lat]
        setLocations(locations)
      })
      addMarker('D2', locations[4], nbmap.current.map, (e) => {
        const newOrigin = e.target.getLngLat()
        locations[4] = [newOrigin.lng, newOrigin.lat]
        setLocations(locations)
      })
      addMarker('D3', locations[5], nbmap.current.map, (e) => {
        const newOrigin = e.target.getLngLat()
        locations[5] = [newOrigin.lng, newOrigin.lat]
        setLocations(locations)
      })
      addMarker('V1-S', locations[6], nbmap.current.map, (e) => {
        const newOrigin = e.target.getLngLat()
        locations[6] = [newOrigin.lng, newOrigin.lat]
        setLocations(locations)
      })
      addMarker('V1-E', locations[7], nbmap.current.map, (e) => {
        const newOrigin = e.target.getLngLat()
        locations[7] = [newOrigin.lng, newOrigin.lat]
        setLocations(locations)
      })
      addMarker('V2-S', locations[8], nbmap.current.map, (e) => {
        const newOrigin = e.target.getLngLat()
        locations[8] = [newOrigin.lng, newOrigin.lat]
        setLocations(locations)
      })
      addMarker('V2-E', locations[9], nbmap.current.map, (e) => {
        const newOrigin = e.target.getLngLat()
        locations[9] = [newOrigin.lng, newOrigin.lat]
        setLocations(locations)
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
    geometries.forEach((g, i) => {
      data.features.push({
        type: 'Feature',
        properties: {
          i: i
        },
        geometry: {
          type: 'LineString',
          coordinates: utils.polyline.decode(g, 5).map((c) => c.reverse())
        }
      })
    })
    source.setData(data)
  }, [geometries])
  function onRequest() {
    if (nbmap.current && isInited.current) {
      if (popup.current) {
        popup.current.remove()
        popup.current = null
      }
      requestOptimization()
    }
  }
  function clearPoints() {
    points.current.forEach((p) => {
      p.marker.remove()
    })
    points.current = []
  }
  return (
    <div className="app optimization-mvrp">
      {loading && <div className="loading">Loading...</div>}
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
        <div>
          Move P(shipment drop point) D(shipment delivery point) V(vehicle start
          and end point) and try request
        </div>
        <div>
          <button onClick={onRequest} className="clear">
            Request
          </button>
        </div>
      </div>
    </div>
  )
}

export default OptimizationDemo
