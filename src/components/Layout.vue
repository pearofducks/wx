<template>
  <div id="app" class="container">
    <header>
      <h1 class="element city">wx</h1>
      <h2 v-if="noCitiesHaveLocation" class="messages">Welcome, please enter a location</h2>
    </header>
    <div class="headers row" :class="{ 'dim': noCitiesHaveLocation }">
      <div class="element add-remove"><button class="circle" @click="addCity">+</button></div>
      <div class="element label" :class="header" v-for="header in weatherAttributes">
        <h3 class="clickable" :class="{ 'active': currentlySorting(header), 'descending': direction() }" @click="sortBy(header)" >{{ header }}</h3>
      </div>
    </div>
    <transition-group name="wx-list">
      <Weather :city="city" v-for="city in cities" :key="city.id" />
    </transition-group>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Weather from './Weather'

export default {
  data: function () {
    return {
      weatherAttributes: ['city', 'country', 'temp', 'humidity', 'conditions', 'wind']
    }
  },
  components: { Weather },
  mounted: function () {
    this.$store.dispatch('loadCities')
    this.$store.dispatch('getWeather')
  },
  computed: {
    ...mapGetters(['noCitiesHaveLocation']),
    ...mapState({
      cities: state => state.cities,
      sortingBy: state => state.sortingBy
    })
  },
  methods: {
    addCity () { this.$store.commit('addCity') },
    sortBy (attribute) { this.$store.dispatch('sortBy', attribute) },
    currentlySorting(header) { return this.sortingBy === header },
    direction () { return this.$store.state.sortAsc }
  }
}
</script>

<style lang="scss">
* { padding: 0; margin: 0; box-sizing: border-box; }
html { font-size: 62.5%; height: 100%; }
body { height: 100%; font-weight: 400; font-style: normal; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; -webkit-text-size-adjust: 100%; line-height: 1.34; color: #333; font-family: "Whitney Narrow SSm A", "Whitney Narrow SSm B", sans-serif; }
h1 { font-size: 2rem; font-weight: 500; text-transform: uppercase; }
h2 { font-size: 1.5rem; font-weight: 400; letter-spacing: -0.05rem; }
h3, button.circle { font-size: 2rem; font-weight: 600; text-transform: uppercase; }
h4 { font-size: 1.5rem; text-transform: uppercase; font-weight: 500; margin: 1rem 0; }
h5 { font-size: 1.5rem; }
a { color: inherit; text-decoration: none; }
input, p, .wind-wrapper { font-size: 1.5rem; font-weight: 500; }
input { font-family: inherit; border: none; border-bottom: 1px solid #bbb; padding: 1.3rem; padding-left: 0; transition: 0.6s all;
  &:focus { border-color: #333; box-shadow: none; outline: none; background-color: #eee;  padding-left: 0.7rem;}
  &:not(:placeholder-shown) { border-color: #eee; background-color: Transparent;
    &:focus { border-color: #333; background-color: #eee; }
  }
  &.isFetching { animation-name: bounce; transform-origin: center bottom; }
}
button { border: none; background: none; }
.container { margin: 0 auto; }
header { margin: 6rem 10.8rem; display: flex; align-items: flex-end; }
.headers { margin: 2.6rem 0; }
.headers.dim h3 { color: #aaa; }
.cities { margin-top: 3.9rem; }
.clickable { color: #333; position: relative; border-top: 1px solid #ddd; display: inline; padding: 0.3rem 0; cursor: pointer; transition: 0.6s all;
  &:hover { color: #333; border-color: #333; }
  &.active { border-color: red;
    &:before { content: "sorted asc"; position: absolute; top: -2rem; font-size: 1rem; white-space: nowrap;}
  }
  &.active.descending { border-color: blue;
    &:before { content: "sorted desc"; position: absolute; top: -2rem; font-size: 1rem; white-space: nowrap; }
  }

}
button.circle { background-color: #333; color: white; width: 3rem; height: 3rem; border-radius: 5rem; line-height: 0; cursor: pointer; padding-bottom: 0.2rem; transition: 0.6s all;
  .weather & { background-color: Transparent; border: 2px solid #333; color: #333; }
}
.row { display: flex; flex-direction: row; align-items: center; }
.element { width: 15vw;
  &.add-remove { width: 3rem; margin: 0 3.9rem; }
  &.city { width: 10vw; margin-right: 2.6rem; }
}
p.wind { margin-left: 0.7rem; }
.weather { transition: all 1s; margin-bottom: 2.6rem; }
.wx-list-enter { opacity: 0; transform: translate3d(0, 100%, 0); }
.wx-list-leave-active { opacity: 0; transform: translate3d(0, 100%, 0); position: absolute; }
.wx-list-move { transition: transform 1s; }
.wx-data-enter-active { animation: fadeInUp .5s; }
.wx-data-leave-active { animation: bounce-out .5s; }

// animations from https://github.com/daneden/animate.css/blob/master/animate.css
.animated { animation-duration: 1s; animation-fill-mode: both; animation-iteration-count: infinite; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translate3d(0, 100%, 0); }
  to { opacity: 1; transform: none; }
}
@keyframes bounce {
  from, 20%, 53%, 80%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); transform: translate3d(0, 0, 0); }
  40%, 43% { animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06); transform: translate3d(0, -20px, 0); }
  70% { animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06); transform: translate3d(0, -10px, 0); }
  90% { transform: translate3d(0, -4px, 0); }
}
@media only screen and (max-width: 1080px) { html { font-size: 8px; } }
@media only screen and (max-width: 480px) {
  html { font-size: 62.5%; }
  header { margin: 2.6rem; }
  .headers .label { display: none; }
  .weather {
    .row.data { flex-direction: column; width: 40vw; margin-left: 2.6rem; }
    .row.data .element, .wind-wrapper { position: relative; white-space: nowrap; }
    &.row { padding: 2.6rem 0; }
    &.row:nth-child(odd) { background-color: hsla(205,35,45,0.1); }
  }
  input, p, .wind-wrapper { font-size: 1.2rem; height: 2rem; }
  input { background-color: Transparent; }
  .element.city { width: 30vw; font-size: 1.6rem; }
  .element.add-remove { margin: 0 2.6rem; }
  .wind-wrapper svg { width: 1.3rem; }
  [aria-label]:before {
    content: attr(aria-label);
    position: absolute;
    left: -8rem;
    font-weight: 300;
  }
}
</style>
