<template>
  <div class="weather row">
    <div class="element add-remove"><button class="circle" @click="remove">-</button></div>
    <input class="element city animated" placeholder="Enter a location" :class="{ 'isFetching': city.isFetching }" @keyup="lazyGetWeather" @keyup.enter="getWeather" v-model="city.location">
    <transition name="wx-data">
      <section v-if="city.hasError"><p>Sorry, there was an error getting weather data for this city</p></section>
      <section class="row data" v-if="city.hasWeather()">
        <p aria-label="country" class="element"> {{ city.weather.country }} </p>
        <p aria-label="temp" class="element"> {{ `${city.weather.temp}°C` }} </p>
        <p aria-label="humidity" class="element"> {{ `${city.weather.humidity}%` }} </p>
        <p aria-label="conditions" class="element"> {{ city.weather.conditions }} </p>
        <div aria-label="wind" class="row wind-wrapper">
          <svg :style="windStyle()" id="i-arrow-top" viewBox="0 0 32 32" width="2.4rem" height="2.4rem" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="6.25%"> <path d="M6 10 L16 2 26 10 M16 2 L16 30" /> </svg>
          <p class="wind">{{ `${Math.round(city.weather.wind)} km/h` }}</p>
        <div>
      </section>
    </transition>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'

export default {
  props: ['city', 'weatherAttributes'],
  methods: {
    lazyGetWeather: debounce(function () {
      this.getWeather()
    }, 1000) ,
    getWeather () { this.$store.dispatch('getWeather') },
    windStyle () { return { transform: `rotate(${ this.city.weather.windDirection }deg)` } },
    remove() { this.$store.commit('removeCity', this.city.id) }
  }
}
</script>
