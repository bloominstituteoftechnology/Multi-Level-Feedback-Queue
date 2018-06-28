const { SchedulerInterrupt } = require('./constants/index');

// A class representation of a process that may be blocking
// or non-blocking. We can specify how much CPU time a process
// needs in order to complete, or we can specify if the process
// is blocking; if so, the amount of blocking time needed is
// randomly determined.
class Process {
    constructor(pid, cpuTimeNeeded=null, blocking=false) {
        //cpuTimeNeeded denotes time needed in order to complete process execution
        this._pid = pid;
        this.queue = null;
        //randomly assigns cpuTimeNeeded if not given for the specific process
        this.cpuTimeNeeded = (cpuTimeNeeded !== null) ? cpuTimeNeeded : Math.round(Math.random() * 1000);
        //randomly assigns blocking time needed, if blocking is true, otherwise sets to 0
        this.blockingTimeNeeded = blocking ? Math.round(Math.random() * 100) : 0;
        // A bool representing whether this process was toggled from blocking to non-blocking or vice versa
        this.stateChanged = false;
    }
    
    setParentQueue(queue) {
        this.queue =  queue;
    }

    isFinished() {
        //checks cpu time needed and blocking time needed
        return (this.cpuTimeNeeded == 0 && this.blockingTimeNeeded == 0);
    }

    executeProcess(time) {
    //the time here is the worktime as created in run() inside of the scheduler constructor
    // If no blocking time is needed by this process, decrement the amount of 
    // CPU time it needs by the input time
    // If blocking time is needed by this process, move it to the blocking queue
    // by emitting the appropriate interrupt
    // Make sure the `stateChanged` flag is toggled appropriately
    
    this.stateChanged = false; //this for when flipping block to running process
    if (this.blockingTimeNeeded == 0) {
        this.cpuTimeNeeded -= time;
        this.cpuTimeNeeded = this.cpuTimeNeeded > 0 ? this.cpuTimeNeeded : 0;
    } else {
        //emit PROCESS_BLOCKED intterrupt
        this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED);
        this.stateChanged = true;
    }
}


    executeBlockingProcess(time) {
    // If this process requires blocking time, decrement the amount of blocking
   // time it needs by the input time
   // Once it no longer needs to perform any blocking execution, move it to the 
   // top running queue by emitting the appropriate interrupt
   // Make sure the `stateChanged` flag is toggled appropriately
        this.blockingTimeNeeded -= time;
        this.blockingTimeNeeded = this.blockingTimeNeeded > 0 ? this.blockingTimeNeeded : 0;

        if (this.blockingTimeNeeded === 0) {
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_READY);
            this.stateChanged = true;
        }
    }


    isStateChanged() {
    // Returns this process's stateChanged property
        return this.StateChanged;
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
