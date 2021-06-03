<template>
  <div class="coords-radius-form">
    <coords-form :coordinate="coordinate" @coord-changed="onLVCoord"></coords-form>
    <form>
      <table>
        <tr>
          <td>Radius:</td>
          <td><input v-model="radius" type="range" min="0" max="100" step="0.5"></td>
          <td><input v-model="radius" type="number" step="0.5"> meters</td>
        </tr>
      </table>
      <a id="dlbtn" class="button" download="extract.xyz">Download</a>
    </form>
  </div>
</template>
<script>
  import CoordsForm from '../coords/CoordsForm.vue';
  import {lv952wgs, wgs2lv95} from '../coords/coords.js';


  export default {
    props: {
      coordinate: Object,
      radius: Number
    },
    components: {
      'coords-form': CoordsForm
    },
    methods: {
      setLatLon(lat, lon) {
        //console.log('App.vue#setLatLon', lat, lon);
        this.coordinate.lat = lat;
        this.coordinate.lon = lon;
        [this.coordinate.N, this.coordinate.E] = wgs2lv95(lat, lon)
      },
      setLv95(N, E) {
        //console.log('App.vue#setLv95', N, E);
        this.coordinate.N = N;
        this.coordinate.E = E;
        [this.coordinate.lat, this.coordinate.lon] = lv952wgs(N, E);
      },
      setRadius(r) {
        //console.log('App.vue#setRadius', r);
        this.radius = r;
      },
      onLVCoord(ev) {
        //console.log('App.vue#onLVCoord: ', ev);
        const c = this.coordinate;
        [c.lat, c.lon, c.N, c.E] = [ev.wgs.lat, ev.wgs.lon, ev.lv95.N, ev.lv95.E];
        //console.log('App.vue#onLVCoord: ', c);
      }
    },
    watch: {
      coordinate: {
        handler() {
          //console.log('App.vue#watch.coordinate: ', this.coordinate);
          this.$emit('coord-radius-change',
                     {coordinate: this.coordinate, radius: parseFloat(this.radius)});
        },
        deep: true
      },
      radius: {
        handler() {
          //console.log('App.vue#watch.radius: ', this.radius);
          this.$emit('coord-radius-change',
                     {coordinate: this.coordinate, radius: parseFloat(this.radius)});
        }
      }
    }
  }
</script>
<style scoped>
.coords-radius-form input {
  margin: 5px;
  padding: 5px;
}


.button {
  display: inline-block;
  text-decoration: none;
  background-color: #eee;
  color: lightgrey;
  margin-top: 5px;
  padding: 5px;
  border: 1px solid lightgrey;
  border-bottom: 1px solid darkgrey;
  border-right: 1px solid darkgrey;
}


.button[href] {
  background-color: green;
  color: white;
}


select {
    padding: 5px;
}
</style>
