let EventEmitter = require("./eventemitter.js").EventEmitter;

export class Keyboard extends EventEmitter {
    constructor(keyListenList) {
        super();

        this.monitoredKeyCodes = [];
        for (let index in keyListenList) {
            this.monitoredKeyCodes.push(keyListenList[index].toUpperCase().charCodeAt(0));
        }

        // Add listreners
        document.body.addEventListener('keydown', event => {
            if (this.monitoredKeyCodes.indexOf(event.keyCode) >= 0) {
                this.emit(String.fromCharCode(event.keyCode));
            }
        });
    }
};
