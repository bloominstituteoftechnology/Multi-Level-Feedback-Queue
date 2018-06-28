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
    
    // Set the queue passed in to the current queue
    setParentQueue(queue) {
        this.queue = queue;
    }

    isFinished() {
        // If both times are 0, it means process is executed and finished
        if (this.cpuTimeNeeded === 0 && this.blockingTimeNeeded === 0) return true;
        return false;
    }

    // If no blocking time is needed by this process, decrement the amount of 
    // CPU time it needs by the input time
    // If blocking time is needed by this process, move it to the blocking queue
    // by emitting the appropriate interrupt
    // Make sure the `stateChanged` flag is toggled appropriately
    executeProcess(time) {
        // Checks to see if blocking time is needed
            // Changes the state to blocking queue from cpu queue
            // Set the flag to true
        // Decrement the cpu time (time process takes to run) by the process allotted
        // If cputime is negative, set it to 0 (just makes more sense than negative time)
        if (this.blockingTimeNeeded > 0) { 
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED);
            this.stateChanged = true;
        }
        this.cpuTimeNeeded -= time;
        if (this.cpuTimeNeeded < 0) this.cpuTimeNeeded = 0;
   }

   // If this process requires blocking time, decrement the amount of blocking
   // time it needs by the input time
   // Once it no longer needs to perform any blocking execution, move it to the 
   // top running queue by emitting the appropriate interrupt
   // Make sure the `stateChanged` flag is toggled appropriately
    executeBlockingProcess(time) {
        // Currently in the blocking queue - decrement the blocking time needed by block time
        // Set time to 0 if negative because it makes more sense
        // Change state from blocking queue to cpu queue / running queue
        // Sets flag to true
        this.blockingTimeNeeded -= time;
        if (this.blockingTimeNeeded < 0) this.blockingTimeNeeded = 0;
        this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_READY);
        this.stateChanged = true;
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
