function validateEventParameters(eventName, listenerFunction) {
    if (typeof(eventName) !== "string") {
        throw Error("Unable to add event listener: event name is not a string. Received: " + typeof(eventName));
    }
    if (typeof(listenerFunction) !== "function") {
        throw Error("Unable to add event listener: listener is not a function. Received: " + typeof(listenerFunction));
    }
}


export class EventEmitter {
    constructor() {
        this.eventList = {};
    }

    on(eventName, listenerFunction) {
        validateEventParameters(eventName, listenerFunction)

        if (!this.eventList.hasOwnProperty(eventName) || !(this.eventList[eventName] instanceof Array)) {
            this.eventList[eventName] = [];
        }
        if (this.eventList[eventName].includes(listenerFunction)) {
            throw Error("The received listener function is already added to event: " + eventName);
        }
        this.eventList[eventName].push(listenerFunction);
        console.debug("[" + this.constructor.name + "] Added listener function for event: " + eventName);

        return true;
    }
    addEventListener(eventName, listenerFunction) {
        return this.on(eventName, listenerFunction);
    }

    off(eventName, listenerFunction) {
        validateEventParameters(eventName, listenerFunction);

        if (!this.eventList.hasOwnProperty(eventName)) {
            console.error("[" + this.constructor.name + "] Cannot remove listener for event: " + eventName + ". There are no listeners for this event");
            return false;
        }
        if (!this.eventList[eventName].includes(listenerFunction)) {
            console.error("[" + this.constructor.name + "] Cannot remove listener. The received function is not subscribed to event: " + eventName);
            return false;
        }
        this.eventList[eventName].splice(this.eventList[eventName].indexOf(listenerFunction), 1);
        return true;
    }
    removeEventListener(eventName, listenerFunction) {
        return this.off(eventName, listenerFunction);
    }

    emit(eventName, ...args) {
        if (typeof(eventName) !== "string") {
            throw Error("Unable to emit event: event name is not a string. Received: " + typeof(eventName));
        }
        if (!this.eventList.hasOwnProperty(eventName)) {
            return false;
        }
        let resultList = [];
        this.eventList[eventName].map((listenerFunction, index) => {
            //console.debug("Calling listener function #" + index + " for event: " + eventName);
            try {
                resultList[index] = listenerFunction.apply(listenerFunction, args);
            } catch (err) {
                console.error("[" + this.constructor.name + "] Exception caught while calling listener function #" + index + " for event: " + eventName);
                console.error(err);
            }
        });

        return resultList;
    }
}
