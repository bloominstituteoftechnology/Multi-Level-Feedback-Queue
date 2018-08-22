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
        this.queue = queue; // setting parent queue to queue

    }

    isFinished() {
        return this.cpuTimeNeeded === 0 && this.blockingTimeNeeded === 0;   // means done/finished if there are no more processes in the cpu queue or blocking queue

    }

    // If no blocking time is needed by this process, decrement the amount of 
    // CPU time it needs by the input time
    // If blocking time is needed by this process, move it to the blocking queue
    // by emitting the appropriate interrupt
    // Make sure the `stateChanged` flag is toggled appropriately
   
    executeProcess(time) {
        this.stateChanged = false;  
        if (this.blockingTimeNeeded === 0) {    // no blocking time is needed by the process
            this.cpuTimeNeeded -= time; // decrement cpu time by the input time
            this.cpuTimeNeeded = this.cpuTimeNeeded > 0 ? this.cpuTimeNeeded: 0;    // if blocking time is needed as stated by blockingTimeNeeded > 0
        } else {
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED); // call interrupt function and move to Blocking/Blocked queue
            this.stateChanged = true;   // toggle state to true
        }
   }

   // If this process requires blocking time, decrement the amount of blocking
   // time it needs by the input time
   // Once it no longer needs to perform any blocking execution, move it to the 
   // top running queue by emitting the appropriate interrupt
   // Make sure the `stateChanged` flag is toggled appropriately

    executeBlockingProcess(time) {  // if process requires blocking time
        this.blockingTimeNeeded -= time;    // decrement blocking time by the input time
        this.blockingTimeNeeded = this.blockingTimeNeeded > 0 ? this.blockingTimeNeeded: 0;

        if (this.blockingTimeNeeded === 0) {    // if blocking time/execution is finished/ no longer needed
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_READY);   // call interrupt function and move it to top cpu queue
            this.stateChanged = true;   // toggle state change to true
        }
    }

    // Returns this process's stateChanged property
    isStateChanged() {
        return this.stateChanged;   // returning state was changed

    }

    get pid() {
        return this._pid    // return process id

    }

    // Private function used for testing; DO NOT MODIFY
    _getParentQueue() {
        return this.queue;  
    }
}

module.exports = Process;

