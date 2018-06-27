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
        //Really simple set the parent queue to queue
        this.queue = queue;
    }

    isFinished() {
        //Must return a boolean like isEmpty() and needs to check cpu and blocking time needed
        return (this.cpuTimeNeeded === 0 && this.blockingTimeNeeded === 0);
    }

    // If no blocking time is needed by this process, decrement the amount of 
    // CPU time it needs by the input time
    // If blocking time is needed by this process, move it to the blocking queue
    // by emitting the appropriate interrupt
    // Make sure the `stateChanged` flag is toggled appropriately
    executeProcess(time) {
        if(this.blockingTimeNeeded === 0) {
            //Checks if blocking time is not needed and keeps the same state if true
            this.stateChanged = false;
            //Decrement cpu time needed by time
            this.cpuTimeNeeded -= time;
            if(this.cpuTimeNeeded < 0) this.cpuTimeNeeded = 0;
            //Need to insure cpu time needed isnt below 0
        }
        else {
            this.stateChanged = true;
            //if the process needs blockingtime then the state has changed
            this.queue.emitInterrupt(this, 'PROCESS_BLOCKED');
            //Emit the interrupt process blocked since it has blocking time needed
        }
   }

   // If this process requires blocking time, decrement the amount of blocking
   // time it needs by the input time
   // Once it no longer needs to perform any blocking execution, move it to the 
   // top running queue by emitting the appropriate interrupt
   // Make sure the `stateChanged` flag is toggled appropriately
    executeBlockingProcess(time) {
            this.blockingTimeNeeded -= time;
            //I dont need to check for blocking time since its assumed we then decrement by time on the blocking time needed
            if(this.blockingTimeNeeded < 0) this.blockingTimeNeeded = 0;
            //Need to insure that blocking time needed isnt less than 0
            if(this.blockingTimeNeeded === 0) {
            this.stateChanged = true;
            //if blocking time is 0 then the state is changed
            this.queue.emitInterrupt(this, 'PROCESS_READY');
            // if the state has changed then this process is ready so we must emit the interrupt
        }
    }

    // Returns this process's stateChanged property
    isStateChanged() {
        return this.stateChanged;
        //Simple return of the property;
    }

    get pid() {
        return this._pid;
        //Simple return of the property;
    }

    // Private function used for testing; DO NOT MODIFY
    _getParentQueue() {
        return this.queue;
    }
}

module.exports = Process;
