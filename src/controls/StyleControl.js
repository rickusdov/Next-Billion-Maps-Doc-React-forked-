import nextbillion from '@nbai/nbmap-gl'

// import { IControl } from '@nbai/nbmap-gl'
// create cusom control implement IControl
class StyleSwitcherControl {
  _options = {}
  _container = undefined
  buttons = []
  constructor(options) {
    this._options = { ...options }
    this._container = document.createElement('div')
    this._container.classList.add('nbmapgl-ctrl')
    this._container.classList.add('nbmapgl-ctrl-styles-switcher')
  }

  onAdd(map) {
    this._map = map
    const styles = this._options.styles
    // add buttons based on the input styles
    Object.keys(styles).forEach((styleID) => {
      const style = styles[styleID]
      const button = document.createElement('button')
      button.classList.add('selection')
      button.innerHTML = style.name
      // change sytle when click
      button.addEventListener('click', (event) => {
        const activeElement = this._container.querySelector('.active')
        if (activeElement === event.target) {
          return
        }
        if (activeElement) activeElement.classList.remove('active')
        button.classList.add('active')
        map.setStyle(`${style.style}?key=${nextbillion.apiKey}`)
      })
      this.buttons.push({
        element: button,
        name: style.name
      })
      this._container.appendChild(button)
      // reset active button when style loaded
      map.on('styledata', () => {
        this.buttons.forEach((button) => {
          if (button.element.classList.contains('active')) {
            button.element.classList.remove('active')
          }
          if (button.name === map.getStyle()?.name) {
            button.element.classList.add('active')
          }
        })
      })
    })

    return this._container
  }

  onRemove() {
    // cleanup when removed
    this._container.parentNode?.removeChild(this._container)
    delete this._map
  }
}

export default StyleSwitcherControl
