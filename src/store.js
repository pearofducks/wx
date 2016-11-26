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
  updateWeatherFailure(error) {
    console.log(error)
    this.isFetching = false
    this.hasError = true
  }
  updateWeatherSuccess(json) {
    this.weather = {
      city: this.location,
      temp: Math.round(json.main.temp),
      humidity: json.main.humidity,
      conditions: json.weather[0].main,
      wind: json.wind.speed,
      windDirection: json.wind.deg,
      country: countryCodes[json.sys.country].name
    }
    this.isFetching = false
  }
}

const state = { cities: [], sortingBy: '', sortAsc: true }
const mutations = {
  addCity: (state, location = "") => state.cities.push(new City(location)),
  removeCity: (state, id) => { state.cities = state.cities.filter( city => city.id != id ) },
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
      if (a.weather[attribute] < b.weather[attribute]) { return -1 }
      else if (a.weather[attribute] > b.weather[attribute]) { return 1 }
      else { return 0 }
    })
  }
}
const actions = {
  removeCity: ({commit, state, dispatch}, id) => {
    commit('removeCity', id)
    dispatch('saveCities')
    // prevent state.cities from being empty (thus no inputs shown to user)
    if (state.cities.length == 0) {
      commit('clearSort')
      commit('addCity')
    }
  },
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
  saveCities: ({getters}) => {
    let valid = getters.validCities
    let save = valid.map( city => city.location )
    if (save.length > 0) {
      localStorage.setItem('cities', JSON.stringify(save))
    }
    else { localStorage.removeItem('cities') }
  },
  getWeather: ({commit, state, dispatch}) => {
    state.cities.forEach( (city) => {
      if (city.location.length == 0) {
        city.clearWeather()
        return
      }
      if (city.newLocation() || ! city.hasWeather()) {
        commit('clearSort')
        city.clearWeather()
        city.isFetching = true
        let appid = ''
        fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city.searchLocation()}&APPID=${appid}&units=metric`)
          .then((response) => { return response.ok ? response.json() : "" })
          .then((json) => {
            city.updateWeatherSuccess(json)
            dispatch('saveCities')
          })
          .catch((error) => { city.updateWeatherFailure(error) })
      }
    })
  }
}

const getters = {
  validCities: (state) => state.cities.filter( city => ! city.hasError && city.hasWeather() ),
  noCitiesHaveLocation: (state) => {
    return ! state.cities.some( city => city.location.length != 0 )
  }
}
export const store = new Vuex.Store({ state, actions, mutations, getters })

