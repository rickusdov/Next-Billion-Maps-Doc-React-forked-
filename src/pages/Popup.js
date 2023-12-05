import React, { useEffect } from 'react'
import '@nbai/nbmap-gl/dist/nextbillion.css'
import nextbillion, { NBMap, Popup } from '@nbai/nbmap-gl'

const PopupDemo = () => {
  useEffect(() => {
    // You need to replace the apiKey with yours
    nextbillion.setApiKey('db20c37e79d4420f9b2f71a766cacb91')
    const nbmap = new NBMap({
      container: 'map',
      style: 'https://api.nextbillion.io/maps/streets/style.json',
      zoom: 11,
      center: { lat: 34.08572, lng: -118.324569 }
    })
    const popupOffsets = {
      top: [0, 0],
      'top-left': [0, 0]
    }
    // add a popup
    new Popup({
      offset: popupOffsets,
      className: 'my-class'
    })
      .setLngLat({ lat: 34.08572, lng: -118.324569 })
      .setHTML('<h1>Hello World!</h1>')
      .setMaxWidth('300px')
      .addTo(nbmap.map)
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
export default PopupDemo
