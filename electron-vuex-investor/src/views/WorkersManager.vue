<template>
  <div>
    Workers Manager
    <div class="special" v-show="commonBool">This div is special</div>
    <table border="2" class="workersmanagertable">
      <tr><td>Worker ID</td><td>Close</td></tr>
      <tr class="workers" v-for="(worker, index) in workers" v-bind:key="index">
        <td>{{ worker.id }}</td>
        <td><button v-bind:workerid="worker.id" v-on:click="closeWorker">X</button></td>
      </tr>
    </table>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();

    const commonBool = computed(() => store.getters.getCommonBool);

    const workers = computed(() => store.getters.getAllWorkers);

    const closeWorker = (e) => {
      let workerid = e.target.getAttribute('workerid');
      store.dispatch('closeWorker', workerid);
    }

    return { commonBool, workers, closeWorker }
  },
}
</script>

<style scoped>
  .workersmanagertable{
    margin-left: auto;
    margin-right: auto;
  }
</style>