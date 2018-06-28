const { SchedulerInterrupt } = require('./constants/index');

// A class representation of a process that may be blocking
// or non-blocking. We can specify how much CPU time a process
// needs in order to complete, or we can specify if the process
// is blocking; if so, the amount of blocking time needed is
// randomly determined.
class Process {
    constructor(pid, cpuTimeNeeded=null, blocking=false) {
        this._pid = pid;
        this.queue = null;
        this.cpuTimeNeeded = (cpuTimeNeeded !== null) ? cpuTimeNeeded : Math.round(Math.random() * 1000);
        this.blockingTimeNeeded = blocking ? Math.round(Math.random() * 100) : 0;
        // A bool representing whether this process was toggled from blocking to non-blocking or vice versa
        this.stateChanged = false;
    }
    
    setParentQueue(queue) { // **
        this.queue = queue; // this.queue from above, set as the queue passed in. 
    }

    isFinished() { // **
        return this.cpuTimeNeeded === 0 && this.blockingTimeNeeded === 0;
    }

    // If no blocking time is needed by this process, decrement the amount of 
    // CPU time it needs by the input time
    // If blocking time is needed by this process, move it to the blocking queue
    // by emitting the appropriate interrupt
    // Make sure the `stateChanged` flag is toggled appropriately
    executeProcess(time) { // **
        this.stateChanged = false; // sets stateChanged to false.
        if(this.blockingTimeNeeded === 0) { // no blocking time needed...
            this.cpuTimeNeeded -= time; // decrement the time from the CPU time needed. 
            if(this.cpuTimeNeeded < 0) { // if blocking time needed is less than 0
                this.cpuTimeNeeded = 0; // cpu time needed is zero.
            }
        } else { // if none of these...
            this.stateChanged = true; // state changed is true, and emit processed blocked. 
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED);
        }
   }

   // If this process requires blocking time, decrement the amount of blocking
   // time it needs by the input time
   // Once it no longer needs to perform any blocking execution, move it to the 
   // top running queue by emitting the appropriate interrupt
   // Make sure the `stateChanged` flag is toggled appropriately
    executeBlockingProcess(time) { // ** 
        this.blockingTimeNeeded -= time; // decrement the blocking time needed by time.
        if (this.blockingTimeNeeded < 0) {
            this.blockingTimeNeeded = 0;
        }
        if(this.blockingTimeNeeded === 0) {
            this.stateChanged = true; // ***** <-------- how do we know what the proper state changed is supposed to be, and when to set it?
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_READY); // found in test. 
        }
    }

    // Returns this process's stateChanged property
    isStateChanged() { // **
        return this.stateChanged;
    }

    get pid() { // **
        return this._pid;
    }

    // Private function used for testing; DO NOT MODIFY
    _getParentQueue() { // **
        return this.queue;
    }
}

module.exports = Process;
