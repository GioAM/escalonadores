importScripts('ww-calc-function.js');

self.onmessage = event => {
    switch (event.data.command) {
      case 'calculate': {
        let result = expensiveFunction();
        self.postMessage({ result });
        close(); break;
      }
    }
  }
  