if (!window.Worker) {
    console.error("Worker not supported by browser. All is lost!");
}

const myWorker = new Worker("./worker.js");

function sendFeatureFlagToWorker(value) {
    myWorker.postMessage(["featureFlag", value]);
    log(`Enqueued featureFlag ${value} for worker`);
}

function callWorkerAPI(value) {
    myWorker.postMessage(["apiCall", value]);
    log(`Enqueued API call with ${value} for worker`);
}

function log(message) {
    console.log(`MAINTR: ${message}`);
}

// /////////////////////////////////////////////////////////////////////////

var e = React.createElement;

function App() {

    const [featureFlag, setFeatureFlag] = React.useState(false);

    React.useEffect(() => {
        return () => {
            log(`App: cleaning up old useEffect registration`);
            callWorkerAPI(featureFlag);
        }
    }, [featureFlag]);

    const onClick = React.useCallback(() => {
        log(`Hey! You clicked the button. Naugty!`);
        // Always enqueue the change to worker first.
        sendFeatureFlagToWorker(!featureFlag);
        // Then set our own.
        setFeatureFlag(!featureFlag);
    }, [featureFlag, setFeatureFlag]);

    return e("button", { onClick }, "Toggle feature flag, dangerously!");
}

const domContainer = document.getElementById('broken-component-container');
const root = ReactDOM.createRoot(domContainer);
root.render(e(App));

// /////////////////////////////////////////////////////////////////////////

class ServiceThatDothFetch {
    constructor() {
        this.featureFlag = false;
    }

    start() {
       this.trigger() 
    }

    callWorkerAPI(value) {
        myWorker.postMessage(["apiCall", value]);
        log(`Enqueued API call with ${value} for worker`);
    }

    trigger() {
        const capturedFeatureFlag = this.featureFlag;
        const capturedCallWorkerApi = this.callWorkerAPI.bind(this);
        const capturedTrigger = this.trigger.bind(this); 
        log(`Captured featureFlag value ${capturedFeatureFlag}`);
        setTimeout(() => {
            log(`Timer expired. Time to do servicy things.`);
            capturedCallWorkerApi(capturedFeatureFlag);
            capturedTrigger();
        }, [1000]);
    }
}

const service = new ServiceThatDothFetch();
const startService = service.start.bind(service);

function toggleFeatureFlag() {
    const newFeatureFlag = !service.featureFlag;
    sendFeatureFlagToWorker(newFeatureFlag);
    service.featureFlag = newFeatureFlag;
}

function App2() {
    return e("div", null, [
        e("button", { key: "start", onClick: startService }, "Start service"),
        e("button", { key: "toggle", onClick: toggleFeatureFlag }, "Toggle feature flag with service")
    ]);
}

const domContainer2 = document.getElementById('broken-service-container');
const root2 = ReactDOM.createRoot(domContainer2);
root2.render(e(App2));