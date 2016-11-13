import Vue from 'vue'
import Vuex from 'vuex'
import shortid from 'shortid'
import countryCodes from './assets/country_codes'

Vue.use(Vuex)

class City {
  constructor (location) {
    this.location = location
    this.fetchedLocation = ""
    this.isFetching = false
    this.hasError = false
    this.clearWeather()
    this.id = shortid.generate()
  }
  searchLocation() {
    this.fetchedLocation = this.location
    return this.location.replace(/\s/g, '')
  }
  clearWeather () {
    this.country = ""
    this.fetchedLocation = ""
    this.hasError = false
    this.weather = {}
  }
  newLocation() {
    return this.fetchedLocation != this.location
  }
  hasWeather() {
    return Object.keys(this.weather).length != 0
  }
  updateWeather(data) {
    // name is added here to shortcut sortCities
    this.weather = {
      city: this.location,
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      conditions: data.weather[0].main,
      wind: data.wind.speed,
      windDirection: data.wind.deg,
      country: countryCodes[data.sys.country].name
    }
    this.isFetching = false
  }
}

const state = { cities: [], sortingBy: '', sortAsc: true }
const mutations = {
  addCity: (state, location = "") => state.cities.push(new City(location)),
  removeCity: (state, id) => {
    state.cities = state.cities.filter( city => city.id != id )
    // prevent state.cities from being empty (thus no inputs shown to user)
    if (state.cities.length == 0) { state.cities.push(new City("")) }
  },
  replaceCities: (state, newcities) => state.cities = newcities,
  clearSort: (state) => state.sortingBy = '',
  sortCities: (state, attribute) => {
    if (state.sortingBy === attribute) {
      state.sortAsc = !state.sortAsc
    }
    else {
      state.sortingBy = attribute
      state.sortAsc = true
    }
    state.cities.sort( (a,b) => {
      if (state.sortAsc) { [a, b] = [b, a] }
      return a.weather[attribute] - b.weather[attribute]
    })
  }
}
const actions = {
  sortBy: ({commit, state}, attribute) => { commit('sortCities', attribute) },
  loadCities: ({commit, state}) => {
    let storedCities = localStorage.getItem('cities')
    if (storedCities) {
      storedCities = JSON.parse(storedCities)
      let loaded = storedCities.map( (location) => new City(location) )
      commit('replaceCities', loaded)
    } else {
      commit('addCity')
    }
  },
  getWeather: ({commit, state, getters}) => {
    let fetched = false
    state.cities.forEach( (city) => {
      if (city.location.length == 0) {
        city.clearWeather()
        return
      }
      if (city.newLocation() || ! city.hasWeather()) {
        commit('clearSort')
        city.clearWeather()
        city.isFetching = true
        fetched = true
        let appid = ''
        fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city.searchLocation()}&APPID=${appid}&units=metric`)
          .then((response) => { return response.ok ? response.json() : "" })
          .then((json) => { city.updateWeather(json) })
          .catch((error) => {
            console.log(error)
            city.isFetching = false
            city.hasError = true
          })
      }
    })
    if (fetched) { getters.saveCities }
  }
}

const getters = {
  saveCities: (state, getters) => {
    let valid = getters.validCities
    let save = valid.map( city => city.location )
    if (save.length > 0) {
      localStorage.setItem('cities', JSON.stringify(save))
      return true
    }
  },
  validCities: (state) => state.cities.filter( city => ! city.hasError && city.hasWeather() ),
  noCitiesHaveLocation: (state) => {
    return ! state.cities.some( city => city.location.length != 0 )
  }
}
export const store = new Vuex.Store({ state, actions, mutations, getters })

