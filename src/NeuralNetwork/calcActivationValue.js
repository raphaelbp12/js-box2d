console.log('webworker loaded')

onmessage = (evt) => {
    postMessage("Worker received data: " + JSON.stringify(evt.data));
};