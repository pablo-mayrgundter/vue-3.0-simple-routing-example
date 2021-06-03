<template>
  <h1>Project</h1>
  <ul>
    <li><v-link href="/">Home</v-link></li>
    <li><v-link href="/project">Project</v-link></li>
    <li><v-link href="/extract">Extract</v-link></li>
    <li><v-link href="/about">About</v-link></li>
  </ul>

  <slot></slot>
</template>

<script>
import VLink from '../components/VLink.vue'

export default {
  components: {
    VLink
  }
}
</script>
