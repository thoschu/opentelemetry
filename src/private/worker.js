// Receive message from main file
self.onmessage = (e) => {
    console.log(e.data);

    // Send message to main file
    self.postMessage('xxxxxx');
}
