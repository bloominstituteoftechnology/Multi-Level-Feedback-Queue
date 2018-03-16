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
        this.cpuTimeNeeded = cpuTimeNeeded ? cpuTimeNeeded : Math.round(Math.random() * 1000);
        this.blockingTimeNeeded = blocking ? Math.round(Math.random() * 100) : 0;
        // A bool representing whether this process was toggled from blocking to non-blocking or vice versa
        this.stateChanged = false;
    }
    
    // Sets this process's `this.queue` property
    setParentQueue(queue) {
        this.queue = queue;
        queue = this._getParentQueue();
        
    }

    // Checks that this process no longer has any more CPU or blocking time it needs
    isFinished() {
        return (this.cpuTimeNeeded === 0 && this.blockingTimeNeeded === 0);
    }

    
    
   
   
    executeProcess(time) {
        // Sets this process's `this.stateChanged` property to `false`
        this.stateChanged = false;
        // Checks to see if this process needs blocking time
        this.isFinished() ? 
             // If it does, emit a queue interrupt to notify the queue that the process is blocked
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED) :
             // Else, decrement this process's `this.cpuTimeNeeded` property by the input `time`
            this.cpuTimeNeeded -= time;
            // Also toggle its `this.stateChanged` property to `true`
        this.stateChanged = true;
        }
   
   
   
  
    executeBlockingProcess(time) {
        // Decrement this process's `this.blockingTimeNeeded` by the input `time`
        this.blockingTimeNeeded -= time;
        // (this.blockingTimeNeeded > 0) ? this.blockingTimeNeeded : 0;
        // If `this.blockingTimeNeeded` is 0 or less, emit a queue interrupt nofifying 
        if(this.blockingTimeNeeded === 0 || this.blockingTimeNeeded < 0) {
           
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_READY);
           
        }
        this.stateChanged = true;
    }

    // Returns this process's `this.stateChanged` property
    isStateChanged() {
        return this.stateChanged;
    }

    // Gets this process's pid
    get pid() {
        return this._pid;
    }

    // Private function used for testing; DO NOT MODIFY
    _getParentQueue() {
        return this.queue;
    }
}

module.exports = Process;
