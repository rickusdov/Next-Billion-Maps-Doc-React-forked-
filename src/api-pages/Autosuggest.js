import React, { useEffect, useState } from 'react'
import '@nbai/nbmap-gl/dist/nextbillion.css'
import axios from 'axios'
import './Autosuggest.css'

const AutoSuggest = () => {
  const APIKEY = 'db20c37e79d4420f9b2f71a766cacb91'
  const [search, setSearch] = useState('')
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  useEffect(() => {
    async function requestAutoSuggest() {
      const res = await axios.get(
        `https://api.nextbillion.io/h/autocomplete?q=${search}&in=countryCode:USA&key=${APIKEY}`
      )
      setItems(res.data.items)
    }
    if (search) {
      requestAutoSuggest()
    } else {
      setItems([])
    }
  }, [search])
  function selectAddress(item) {
    setSelectedItem(item)
  }
  return (
    <div className="app autosuggest">
      <div className="controls">
        <h2>Search in USA</h2>
        <label>Input:</label>
        <input
          onChange={(e) => {
            setSearch(e.target.value)
          }}
          value={search}></input>
      </div>
      <div className="candidate">
        <h2>Candidate List</h2>
        {items
          ? items
              .map((item, i) => {
                return (
                  <div key={i}>
                    {item.title}
                    <button
                      onClick={() => {
                        selectAddress(item)
                      }}>
                      detail
                    </button>
                  </div>
                )
              })
              .flat()
          : null}
      </div>

      {(() => {
        return (
          selectedItem && (
            <div className="detail">
              <h2>Detail</h2>
              <div>
                <label>city:</label> {selectedItem.address.city}
              </div>
              <div>
                <label>countryCode:</label> {selectedItem.address.countryCode}
              </div>
              <div>
                <label>countryName:</label> {selectedItem.address.countryName}
              </div>
              <div>
                <label>country:</label> {selectedItem.address.country}
              </div>
              <div>
                <label>label:</label> {selectedItem.address.label}
              </div>
              <div>
                <label>postalCode:</label> {selectedItem.address.postalCode}
              </div>
              <div>
                <label>state:</label> {selectedItem.address.state}
              </div>
              <div>
                <label>stateCode:</label> {selectedItem.address.stateCode}
              </div>
              <div>
                <label>street:</label> {selectedItem.address.street}
              </div>
            </div>
          )
        )
      })()}
    </div>
  )
}

export default AutoSuggest
