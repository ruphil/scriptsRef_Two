<template>
  <div>
    <div id="nav">
      <router-link to="/">Trades History</router-link>  |
      <router-link to="/portfoliomanager">Portfolio Manager</router-link> |
      <router-link to="/analysisreports">Analysis Reports</router-link> |
      <router-link to="/stocksscreener">Stocks Screener</router-link>  |
      <router-link to="/dataanalyst">Data Analyst</router-link> |
      <router-link to="/datamanager">Data Manager</router-link> |
      <router-link to="/workersmanager">Workers Manager</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding-bottom: 30px;
}
#nav a {
  font-weight: bold;
  color: #2c3e50;
}
#nav a.router-link-exact-active {
  color: #42b983;
}
</style>