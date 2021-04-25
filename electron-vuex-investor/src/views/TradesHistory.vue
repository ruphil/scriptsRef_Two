<template>
  <div>
    <img alt="Vue logo" src="../assets/logo.png">
    <TradesHistory msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import TradesHistory from '@/components/TradesHistory.vue'

export default {
  components: {
    TradesHistory
  }
}
</script>
