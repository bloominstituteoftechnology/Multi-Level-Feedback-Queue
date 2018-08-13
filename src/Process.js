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
    
    setParentQueue(queue) {
        this.queue = queue;
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
        this.stateChanged = false; // I was getting wonky errors before I added this line
        if (this.blockingTimeNeeded === 0) {
            this.cpuTimeNeeded -=time;
            if (this.cpuTimeNeeded < 0) {
            this.cpuTimeNeeded = 0;
            }
// I had to add the part about cpuTimeNeeded < 0 for the tests to pass. I guess that makes sense because you can't really have negative time.
        }
        else {
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED);
            this.stateChanged = true;
        }
   }

   // If this process requires blocking time, decrement the amount of blocking
   // time it needs by the input time
   // Once it no longer needs to perform any blocking execution, move it to the 
   // top running queue by emitting the appropriate interrupt
   // Make sure the `stateChanged` flag is toggled appropriately
    executeBlockingProcess(time) {
        this.blockingTimeNeeded -= time;
        if (this.blockingTimeNeeded < 0 ) {
            this.blockingTimeNeeded = 0;
        } 
// same as above for cpuTimeNeeded - this avoids the problem of negative time
        if (this.blockingTimeNeeded === 0) {
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_READY);
            this.stateChanged = true;
        }
    }

    // Returns this process's stateChanged property
    isStateChanged() {
        return this.stateChanged; 
    }

    get pid() {
        return this._pid;
    }
// It took me awhile to figure out I needed an underscore until I finally looked back up at the constructor :P 
    // Private function used for testing; DO NOT MODIFY
    _getParentQueue() {
        return this.queue;
    }
}

module.exports = Process;
