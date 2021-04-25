<template>
  <div class="downloader">
    <input type="text" placeholder="year" v-model="yearinput"/>
    <button v-on:click="startDownloading">Start Downloading</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const yearinput = ref('2001');

    const startDownloading = () => {
      console.log('Download is Starting...');

      let ws = new WebSocket('ws://localhost:8080');
      ws.addEventListener('message', (evt) => {
        console.log(evt.data);
      });

      ws.addEventListener('open', () => {
        let commandObj = {
          action: 'download',
          year: yearinput.value
        };
        
        ws.send(Buffer.from(JSON.stringify(commandObj)).toString('base64'));
      });
    }

    return { yearinput, startDownloading }
  },
}
</script>