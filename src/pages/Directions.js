import React, { useEffect } from 'react'
import '@nbai/nbmap-gl/dist/nextbillion.css'
import nextbillion, { NBMap, DirectionsService } from '@nbai/nbmap-gl'

const DirectionsDemo = () => {
  useEffect(() => {
    nextbillion.apiKey = 'db20c37e79d4420f9b2f71a766cacb91'
    const nbmap = new NBMap({
      container: document.getElementById('map'),
      style: 'https://api.nextbillion.io/maps/streets/style.json',
      zoom: 10,
      center: { lat: 34.08572, lng: -118.324569 }
    })

    nbmap.on('load', function () {
      const directionsService = new DirectionsService()
      // request the directions api
      directionsService
        .route({
          origin: { lat: 34.06, lng: -118.424569 },
          waypoints: [{ lat: 33.98, lng: -118.354569 }],
          destination: { lat: 34.06, lng: -118.224569 }
        })
        .then((response) => {
          // render the result
          nbmap.map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: nextbillion.utils.polyline
                  .decode(response.routes[0].geometry, 6)
                  .map((c) => c.reverse())
              }
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
        })
    })
  })

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
export default DirectionsDemo
