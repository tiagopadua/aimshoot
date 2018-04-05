let EventEmitter = require("./eventemitter.js").EventEmitter;


function getObjectCoords(domObject) {
    let box = domObject.getBoundingClientRect();
    let clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
    let clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;

    return {
        top: Math.round(box.top - clientTop),
        left: Math.round(box.left - clientLeft)
    };
}

function getMouseObjectXY(mouseEvent, domObject) {
    // Calculate mouse position inside DOM Object
    let domCoords = getObjectCoords(domObject);
    return {
        x: mouseEvent.clientX - domCoords.left,
        y: mouseEvent.clientY - domCoords.top
    }
}

export class MouseMove extends EventEmitter {
    constructor(targetObject) {
        super();

        this.locked = false;
        this._targetDOM = targetObject;

        this.position = {
            x: 0,
            y: 0
        };
        this.limits = {
            left: 0,
            top: 0,
            right: targetObject.offsetWidth,
            bottom: targetObject.offsetHeight
        }

        this._targetDOM.requestPointerLock = this._targetDOM.requestPointerLock || this._targetDOM.mozRequestPointerLock || this._targetDOM.webkitRequestPointerLock;

        window.addEventListener("blur", () => this.unlock());
        document.addEventListener("pointerlockchange", event => {
            if ((document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement) === this._targetDOM) {
                if (this.locked) {
                    return;
                }
                this.locked = true;
                // Reset current position
                this.position.x = 350;
                this.position.y = 300;

                this.emit("lock");
                this.addListeners();
            } else {
                if (!this.locked) {
                    return;
                }
                this.locked = false;
                this.removeListeners();
                this.emit("unlock");
            }
        })
    }

    addListeners() {
        this.mousedownHandler = event => {
            if (event.which !== 1) { return; } // Consider only LEFT clicks
            this.onMouseDown(event);
        };
        this.mousemoveHandler = event => this.onMouseMove(event);
        this.mouseupHandler = event => this.onMouseUp(event);

        this._targetDOM.addEventListener("mousedown", this.mousedownHandler);
        window.addEventListener("mousemove", this.mousemoveHandler);
        window.addEventListener("mouseup", this.mouseupHandler);
    }

    removeListeners() {
        this._targetDOM.removeEventListener("mousedown", this.mousedownHandler);
        window.removeEventListener("mousemove", this.mousemoveHandler);
        window.removeEventListener("mouseup", this.mouseupHandler);
    }

    onMouseDown(event) {
        this.emit("down", this.position);
    }

    onMouseMove(event) {
        this.updatePosition(event.movementX, event.movementY);
        this.emit("move", this.position);
    }

    onMouseUp(event) {
        this.emit("up");
    }

    updatePosition(deltaX, deltaY) {
        this.position.x = Math.max(this.limits.left, Math.min(this.limits.right, this.position.x + deltaX));
        this.position.y = Math.max(this.limits.top, Math.min(this.limits.bottom, this.position.y + deltaY));
    }

    lock() {
        // Setup mouse control
        this._targetDOM.requestPointerLock();
    }

    unlock() {
        document.exitPointerLock();
        this.removeListeners();
    }
}
