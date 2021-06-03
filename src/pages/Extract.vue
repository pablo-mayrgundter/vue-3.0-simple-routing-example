<template>
  <div>
  <main-layout>
  MainLayout Area
  </main-layout>
    <h1>XYZ Extract Tool</h1>
    <div id="pad">
      <div id="view" style="width: 50%; height: 50%; min-width: 640px; min-height: 480px"></div>
    </div>
    <div id="control-panel">
      <h2>Data Source</h2>
      <label for="area">Choose an area:</label>
      <select name="sources">
        <option value="testdata/zurich-sample.xyz">Canton Zürich (sample)</option>
        <option value="testdata/DTM_GRID_XYZ.xyz">Astra</option>
<!--        <option value="testdata/test.xyz">Test points</option> -->
      </select>
      <form>
        Or upload your own: <input id="fileLoader" type="file" accept=".xyz">
      </form>
      <h2>Project data</h2>
      <h3>by reference point</h3>
      <div id="app">
        <extract-tool :coordinate="coordinate" :radius="radius"
                      @coord-radius-change="onCoordRadiusChange"></extract-tool>
      </div>
    </div>
</div>
</template>

<script>
import MainLayout from '../layouts/Main.vue';
import ExtractTool from '../components/extract/App.vue';


export default {
  components: {
    MainLayout,
    'extract-tool': ExtractTool
  },
  data() {
    return {
      coordinate: {lat: 0, lon: 1},
      radius: 3
    }
  },
}
</script>
