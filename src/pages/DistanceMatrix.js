import React, { useEffect, useRef, useState } from 'react'
import '@nbai/nbmap-gl/dist/nextbillion.css'
import nextbillion, {
  DistanceMatrixService,
  AvoidType,
  TravelMode,
  ApproachType,
  Marker,
  DistanceMatrixResult
} from '@nbai/nbmap-gl'
import './DistanceMatrix.css'

const DistanceMatrixDemo = () => {
  const nbmap = useRef(null)
  const popup = useRef(null)
  const isInited = useRef(false)
  const distanceMatrixService = useRef(new DistanceMatrixService())
  const [origins, setOrigins] = useState([
    { lat: 34.0497886451671, lng: -118.1668973317792 },
    { lat: 34.00974865852345, lng: -118.1607900390693 }
  ])
  const [destinations, setDestinations] = useState([
    {
      lat: 34.0043422415353,
      lng: -118.28598953147242
    },
    {
      lat: 34.04095376515966,
      lng: -118.28090012122992
    }
  ])
  const [rows, setRows] = useState([])
  function requestDistanceMatrix() {
    distanceMatrixService.current
      .getDistanceMatrix({
        origins: origins,
        destinations: destinations,
        departureTime: +new Date(),
        mode: TravelMode.FOUR_WHEELS,
        avoid: AvoidType.HIGHWAY,
        approaches: [ApproachType.CURB, ApproachType.CURB]
      })
      .then((response) => {
        setRows(response.rows)
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
      isInited.current = true
      const originElement = document.createElement('div')
      originElement.className = 'origin-marker'
      originElement.innerHTML = 'S1'
      const originMarker1 = new Marker({
        draggable: true,
        element: originElement
      })
        .setLngLat(origins[0])
        .on('dragend', (e) => {
          const newOrigin = e.target.getLngLat()
          origins[0] = newOrigin
          setOrigins([...origins])
        })
        .addTo(nbmap.current.map)
      const originElement2 = document.createElement('div')
      originElement2.innerHTML = 'S2'
      originElement2.className = 'origin-marker'
      const originMarker2 = new Marker({
        draggable: true,
        element: originElement2
      })
        .setLngLat(origins[1])
        .on('dragend', (e) => {
          const newOrigin = e.target.getLngLat()
          origins[1] = newOrigin
          setOrigins([...origins])
        })
        .addTo(nbmap.current.map)
      const destination = document.createElement('div')
      destination.innerHTML = 'D1'
      destination.className = 'destination-marker'
      const destinationMarker = new Marker({
        draggable: true,
        element: destination
      })
        .setLngLat(destinations[0])
        .on('dragend', (e) => {
          const newDest = e.target.getLngLat()
          destinations[0] = newDest
          setDestinations([...destinations])
        })
        .addTo(nbmap.current.map)
      const destination2 = document.createElement('div')
      destination2.innerHTML = 'D2'
      destination2.className = 'destination-marker'
      const destinationMarker2 = new Marker({
        draggable: true,
        element: destination2
      })
        .setLngLat(destinations[1])
        .on('dragend', (e) => {
          const newDest = e.target.getLngLat()
          destinations[1] = newDest
          setDestinations([...destinations])
        })
        .addTo(nbmap.current.map)
      requestDistanceMatrix()
    })
  })
  useEffect(() => {
    if (nbmap.current && isInited.current) {
      if (popup.current) {
        popup.current.remove()
        popup.current = null
      }
      requestDistanceMatrix()
    }
  }, [origins, destinations])
  return (
    <div className="app distace-matrix">
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: '0',
          left: '0'
        }}
        id="map"></div>
      <div className="results">
        {rows.map((item, startIndex) => {
          return item.elements
            .map((element, endIndex) => {
              return (
                <div key={startIndex + '-' + endIndex}>
                  <div>{`S${startIndex + 1} => D${endIndex + 1}`}</div>
                  <div>Distance: {element.distance.value} m</div>
                  <div>Duration: {element.duration.value} s</div>
                </div>
              )
            })
            .flat()
        })}
      </div>
    </div>
  )
}

export default DistanceMatrixDemo
