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

export class MouseMove {
    constructor(targetObject, onMouseMove, onMouseDown, onMouseUp) {
        this._targetDOM = targetObject;
        this._mouseDragging = false;
        this._onMouseMove = onMouseMove;
        this._onMouseDown = onMouseDown;
        this._onMouseUp = onMouseUp;
    }

    addListeners() {
        // MOUSE input handling
        this.mousedownHandler = event => {
            if (event.which !== 1) { return; } // Consider only LEFT clicks
            this.onMouseDown(event)
        };
        this.mousemoveHandler = event => this.onMouseMove(event);
        this.mouseupHandler = event => this.onMouseUp(event);

        this._targetDOM.addEventListener("mousedown", this.mousedownHandler);
        window.addEventListener("mousemove", this.mousemoveHandler);
        window.addEventListener("mouseup", this.mouseupHandler);

        // TOUCH input handling
        this.touchstartHandler = event => {
            if (event.which !== 1) { return; } // Consider only LEFT clicks
            event.preventDefault();
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
            this.onMouseDown(event);
        };
        this.touchmoveHandler = event => {
            event.preventDefault();
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
            this.onMouseMove(event);
        };
        this.touchendHandler = event => {
            event.preventDefault();
            this.onMouseUp(event);
        };
        this.touchcancelHandler = event => {
            event.preventDefault();
            this.onMouseUp(event);
        };
        this._targetDOM.addEventListener("touchstart", this.touchstartHandler);
        window.addEventListener("touchmove", this.touchmoveHandler);
        window.addEventListener("touchend", this.touchendHandler);
        window.addEventListener("touchcancel", this.touchcancelHandler);

        window.addEventListener("blur", this.mouseupHandler);  // Same handler as mouseUp: stop the control
    }

    removeListeners() {
        // Mouse
        this._targetDOM.removeEventListener("mousedown", this.mousedownHandler);
        window.removeEventListener("mousemove", this.mousemoveHandler);
        window.removeEventListener("mouseup", this.mouseupHandler);
        // Touch
        this._targetDOM.removeEventListener("touchstart", this.touchstartHandler);
        window.removeEventListener("touchmove", this.touchmoveHandler);
        window.removeEventListener("touchend", this.touchendHandler);
        window.removeEventListener("touchcancel", this.touchcancelHandler);
    }

    onMouseDown(event) {
        this._mouseDragging = true;
        this._onMouseDown(getMouseObjectXY(event, this._targetDOM));
    }

    onMouseMove(event) {
        this._onMouseMove(getMouseObjectXY(event, this._targetDOM), this._mouseDragging);

        // Do not propagate event when dragging
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.cancelBubble = true;
        event.returnValue = false;
        return false;
    }

    onMouseUp(event) {
        this._mouseDragging = false;
        this._onMouseUp();
    }
}
