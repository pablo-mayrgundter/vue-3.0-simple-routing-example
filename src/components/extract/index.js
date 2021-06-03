import * as Vue from 'vue';
import VueRouter from 'vue-router'
import * as Diurnal from '@pablo-mayrgundter/diurnal.js';
import * as permalink from '../permalink.js';
import Fullscreen from '@pablo-mayrgundter/fullscreen.js';
import {XYZLoader} from 'three/examples/jsm/loaders/XYZLoader.js';

import App from './App.vue';
import FileLoaderControl from './FileLoaderControl.js';
import SelectionControl from './SelectionControl.js';
import View from './View.js';
import XYZObject from './XYZObject.js';

// TODO get rid of this
import {lv952wgs, wgs2lv95} from '../coords/coords.js';

// TODO(https://github.com/buildrs/xyz/issues/1): CSS loading is weird.
import css from '../../public/index.css';


Diurnal.bind();
new Fullscreen(document.getElementById('view'));


let sc;
const view = new View();
let comp;
const app = Vue.createApp({
  components: {
    'extract-tool': App
  },
  data() {
    return {
      coordinate: {
        lat: permalink.lat,
        lon: permalink.lon,
        N: permalink.lat, // todo: convert
        E: permalink.lon,
      },
      radius: permalink.radius
    }
  },
  created() {
    //console.log(`created: ${this.coordinate}`);
    comp = this;
    window.comp = comp;
  },
  methods: {
    setCoord(N, E, R) {
      this.coordinate.N = N;
      this.coordinate.E = E;
      [this.coordinate.lat, this.coordinate.lon] = lv952wgs(N, E);
      this.radius = R;
      //console.log('index.js#init', this.coordinate, this.radius);
      this.onCoordRadiusChange({coordinate: this.coordinate, radius: this.radius});
    },
    onCoordRadiusChange(event) {
      const c = event.coordinate, r = event.radius;
      //const c = this.coordinate, r = this.radius;
      //console.log(`coord-radius-change: wgs(${c.lat},${c.lon}) lv(${c.N},${c.E}) r(${r})`);
      const zoom = {
        Xmin: c.E - r,
        Xmax: c.E + r,
        Ymin: c.N - r,
        Ymax: c.N + r,
      };
      view.focus(zoom);
      sc.processBounds(zoom, document.getElementById('dlbtn'));
    },
  },
  watch: {
    coord: {
      handler() {
        //console.log('index.js#coord handler', this.coordinate);
      },
      deep: true
    },
    radius: {
      handler() {
        //console.log('index.js#radius handler', this.radius);
      },
      deep: true
    }
  }
});
app.mount('#app');


const display = geometry => {
  //console.log('index.js#display');
  const obj = new XYZObject(geometry);
  view.displayXYZObject(obj);
  const bounds = obj.shape.sourceBounds;
  sc = new SelectionControl(obj, obj.shape.sourceBounds, obj.shape.viewBounds, zoom => {
    //view.focus(zoom);
  });
  if (comp) {
    const N = bounds.min.y + (bounds.max.y - bounds.min.y) / 2;
    const E = bounds.min.x + (bounds.max.x - bounds.min.x) / 2;
    //console.log(comp, bounds, N, E);
    comp.setCoord(N, E, 1);
  } else {
    //console.error('comp not yet defined');
  }
};


const selectElt = document.querySelector("select[name='sources']");
selectElt.addEventListener('change', () => {
    new XYZLoader().load(selectElt.value, display);
});
new XYZLoader().load(selectElt.value, display);

const fileLoaderElt = document.getElementById('fileLoader');
const fileCtrl = new FileLoaderControl(fileLoaderElt, loadedXyz => {
    display(new XYZLoader().parse(loadedXyz));
  });


function handleHash() {
  let hash = location.hash.substr(1);
}
window.addEventListener('hashchange', handleHash);
handleHash();
