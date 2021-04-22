<template>
  <div id="main">
    <iframe ref="iframeref" src="" frameborder="0" height="100%" width="100%"></iframe>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const iframeref = ref(null);

    const getWSSURL = () => {
      axios.get('https://raw.githubusercontent.com/daw-kgdc/file-host-permanent/main/vue-attendance-register/app.json')
      .then((res) => {
        iframeref.value.src = 'http://' + res.data.serverIP + ':' + res.data.httpPort;
      });
    }

    onMounted(getWSSURL);

    return { iframeref }
  },
}
</script>

<style>
  body, html {
    margin: 0; padding: 0; height: 100%; overflow: hidden;
  }

  #main{
    position:absolute; left: 0; right: 0; bottom: 0; top: 0px; 
  }
</style>