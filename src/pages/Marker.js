import React, { useEffect } from 'react'
import '@nbai/nbmap-gl/dist/nextbillion.css'
import nextbillion, { NBMap, Marker, Popup } from '@nbai/nbmap-gl'

function addSimpleMarker(nbmap) {
  const popup = new Popup({ offset: 25, closeButton: false }).setText(
    'Simple Marker'
  )
  const marker = new Marker()
    .setLngLat({ lat: 34.08572, lng: -118.124569 })
    .setPopup(popup)
    .addTo(nbmap.map)
  marker.togglePopup()
}

function addDraggableMarker(nbmap) {
  const popup = new Popup({ offset: 25, closeButton: false }).setText(
    'Draggable Marker'
  )
  const marker = new Marker({
    draggable: true
  })
    .setLngLat({ lat: 34.08572, lng: -118.224569 })
    .setPopup(popup)
    .addTo(nbmap.map)
  marker.togglePopup()
  marker.on('dragend', () => {
    console.log(marker.getLngLat())
  })
}

function addCustomMarkerWithDom(nbmap) {
  const popup = new Popup({ offset: 10, closeButton: false }).setText(
    'Custom Marker'
  )
  const el = document.createElement('div')
  el.className = 'marker'
  el.style.backgroundImage =
    'url(https://static.nextbillion.io/docs-next/navigation-arrow-icon.png)'
  el.style.backgroundSize = 'cover'
  el.style.width = '36px'
  el.style.height = '36px'
  const marker = new Marker({
    element: el
  })
    .setLngLat({ lat: 34.08572, lng: -118.024569 })
    .setPopup(popup)
    .addTo(nbmap.map)

  marker.togglePopup()
}

const MarkerDemo = () => {
  useEffect(() => {
    nextbillion.setApiKey('db20c37e79d4420f9b2f71a766cacb91')
    const nbmap = new NBMap({
      container: 'map',
      style: 'https://api.nextbillion.io/maps/streets/style.json',
      zoom: 11,
      center: { lat: 34.08572, lng: -118.124569 }
    })
    addSimpleMarker(nbmap)
    addDraggableMarker(nbmap)
    addCustomMarkerWithDom(nbmap)
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
export default MarkerDemo
