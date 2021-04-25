<template>
    <div class="controllers">
      <span>Total Data Available</span>
      <button v-on:click="startWorker">Start Working</button>
      <button v-on:click="changeIt">Mess with Global Store</button>
      <div>{{ commonBool }}</div>
    </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

import workerFunctions from '../composables/workerFunctions';

export default {
    setup() {
      const store = useStore();

      const commonBool = computed(() => store.getters.getCommonBool);

      const { startWorker } = workerFunctions();

      const changeIt = () => {
        console.log('change it')
        store.dispatch('changeCommonBool');
      }

      return { commonBool, startWorker, changeIt }
    }
}
</script>

<style scoped>
  .controllers {
    background-color: grey;
  }
</style>