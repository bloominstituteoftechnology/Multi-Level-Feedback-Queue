const { SchedulerInterrupt } = require('./constants/index');

// A class representation of a process that may be blocking
// or non-blocking. We can specify how much CPU time a process
// needs in order to complete, or we can specify if the process
// is blocking; if so, the amount of blocking time needed is
// randomly determined.
class Process {
    constructor(pid, cpuTimeNeeded = null, blocking = false) {
        this._pid = pid; // process identification number
        this.queue = null; // process starts out not having a queue
        this.cpuTimeNeeded = (cpuTimeNeeded !== null) ? cpuTimeNeeded : Math.round(Math.random() * 1000); // if the process doesn't already have cpuTimeNeeded, give it a random integer between 0 and 1000
        this.blockingTimeNeeded = blocking ? Math.round(Math.random() * 100) : 0; // if process has blocking, set to a random integer between 0 and 100 - else, set to 0
        // A bool representing whether this process was toggled from blocking to non-blocking or vice versa
        this.stateChanged = false;
    }

    setParentQueue(queue) {
        return this.queue = queue;
    }

    isFinished() {
        return this.cpuTimeNeeded === 0 && this.blockingTimeNeeded === 0;
    }

    // If no blocking time is needed by this process, decrement the amount of 
    // CPU time it needs by the input time
    // If blocking time is needed by this process, move it to the blocking queue
    // by emitting the appropriate interrupt
    // Make sure the `stateChanged` flag is toggled appropriately
    executeProcess(time) {
        this.stateChanged = false;
        if (this.blockingTimeNeeded === 0) {
            this.cpuTimeNeeded -= time;
        }
        else {
            this.stateChanged = true;
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED);
        }
        if (this.cpuTimeNeeded < 0) {
            this.cpuTimeNeeded = 0;
        }
    }

    // If this process requires blocking time, decrement the amount of blocking
    // time it needs by the input time
    // Once it no longer needs to perform any blocking execution, move it to the 
    // top running queue by emitting the appropriate interrupt
    // Make sure the `stateChanged` flag is toggled appropriately
    executeBlockingProcess(time) {
        if (this.blockingTimeNeeded) {
            this.blockingTimeNeeded -= time;
        }
        if (this.blockingTimeNeeded <= 0) {
            this.stateChanged = true;
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_READY);
            this.blockingTimeNeeded = 0;
        }
    }

    // Returns this process's stateChanged property
    isStateChanged() {
        return this.stateChanged;
    }

    get pid() {
        return this._pid;
    }

    // Private function used for testing; DO NOT MODIFY
    _getParentQueue() {
        return this.queue;
    }
}

module.exports = Process;
