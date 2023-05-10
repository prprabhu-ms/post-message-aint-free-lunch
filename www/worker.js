onmessage = (e) => {
    if (e.data[0] === "featureFlag") {
        setFeatureFlag(e.data[1]);
        return;
    }

    if (e.data[0] === "apiCall") {
        handleApiCall(e.data[1]);
        return;
    }

    console.error(`Worker received unexpected message ${e}`);
}

let featureFlag = false;

function setFeatureFlag(value) {
    featureFlag = value;
    log(`featureFlag set to ${value}`);
}

function handleApiCall(value) {
    if (featureFlag !== value) {
        log(`💥: Worker received mismatched API call value ${value}, featureFlag is ${featureFlag}`);
    } else {
        log(`✅: Worker received matching API call value ${value}`);
    }
}

function log(message) {
    console.log(`WORKER: ${message}`);
}