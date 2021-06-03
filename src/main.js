import { createApp, h } from 'vue'
import CoordsForm from './components/coords/CoordsForm.vue';
import routes from './routes'

const SimpleRouterApp = {
  data: () => ({
    currentRoute: window.location.pathname
  }),

  computed: {
    ViewComponent () {
      const matchingPage = routes[this.currentRoute] || '404';
      return require(`./pages/${matchingPage}.vue`).default;
    }
  },

  render () {
    return h(this.ViewComponent)
  },

  created () {
    window.addEventListener('popstate', () => {
      this.currentRoute = window.location.pathname
    })
  }
}

const app = createApp(SimpleRouterApp);
app.component(CoordsForm);
app.mount('#app');

