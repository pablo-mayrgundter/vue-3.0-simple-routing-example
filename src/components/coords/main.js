import * as Vue from 'vue';
import * as Diurnal from '@pablo-mayrgundter/diurnal.js';
import CoordsForm from './CoordsForm.vue';
import {
  deg2rad,
  dms2deg,
  wgs2lv95
} from './coords.js';

// TODO(https://github.com/buildrs/xyz/issues/1): CSS loading is weird.
import css from '../../public/index.css';

Diurnal.bind();
// TODO: make this an arg to bind
document.querySelector('#diurnal-controls').style.visibility = 'hidden';


const bern = { lat: 46.951082773, lng: 7.438632421 };
const app = Vue.createApp({
  data() {
    return {
      coordinate: {
        lat: bern.lat,
        lon: bern.lng
      }
    }
  },
  components: {
    'coords-form': CoordsForm
  },
  methods: {
    onCoordChanged(event) {
      centerMap(event.wgs.lat, event.wgs.lon);
    }
  }
});
app.mount('#app');


function $(id) {
  return document.getElementById(id);
}

let map, marker;


// Initialize and add the map
window.initMap = () => {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 17,
    center: bern,
  });
  marker = new google.maps.Marker({
    position: bern,
    map: map,
  });
};


function centerMap(lat, lon) {
  // Avoid race at startup
  if (marker && map) {
    marker.setPosition(new google.maps.LatLng(lat, lon));
    map.panTo(new google.maps.LatLng(lat, lon));
  }
}
