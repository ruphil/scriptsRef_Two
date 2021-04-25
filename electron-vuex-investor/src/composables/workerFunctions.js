import { useStore } from 'vuex';
import { v4 as uuidv4 } from 'uuid';

import Worker1 from 'worker-loader!../workers/downloadWorker';

const workerFunctions = () => {
    const store = useStore();

    const bindOnMessageEvent = (worker, workerID) => {
        worker.onmessage = function (event) {
            let data = event.data;
            console.log(data);
            if (data.msg == 'exit'){
                store.dispatch('removeWorker', workerID);
                worker.terminate();
            }
        }
    }

    const startWorker = async () => {
        console.log('Allotting New Worker...');

        let workerID = uuidv4();
        let worker = new Worker1();
        bindOnMessageEvent(worker, workerID);

        store.dispatch('addWorker', { id: workerID, worker });
    }

    return { startWorker }
}

export default workerFunctions;
