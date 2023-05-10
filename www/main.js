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