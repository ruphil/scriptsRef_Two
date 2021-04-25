import { createStore } from 'vuex'

export default createStore({
  state: {
    commonBool: false,
    workers: []
  },
  getters: {
    getCommonBool(state){
      return state.commonBool;
    },
    getAllWorkers(state){
      return state.workers
    }
  },
  mutations: {
    changeCommonBool(state){
      state.commonBool = !state.commonBool;
    },
    addWorker(state, workerObj){
      state.workers = [...state.workers, workerObj];
    },
    removeWorker(state, workerID){
      state.workers = state.workers.filter((worker) => {
        return worker.id != workerID
      });
    },
    closeWorker(state, workerID){
      let workerByID = null;
      
      for (let i = 0; i < state.workers.length; i++){
        let workerObj = state.workers[i];
        let workeridToClose = workerObj.id;
        if(workeridToClose == workerID){
          workerByID = workerObj.worker;
        }
      }

      workerByID.postMessage({ command: 'close' });
    }
  },
  actions: {
    changeCommonBool(context){
      context.commit('changeCommonBool')
    },
    addWorker(context, workerObj){
      context.commit('addWorker', workerObj);
    },
    removeWorker(context, workerID){
      context.commit('removeWorker', workerID);
    },
    closeWorker(context, workerID){
      context.commit('closeWorker', workerID);
      context.commit('removeWorker', workerID);
    },
  },
  modules: {
  }
})
