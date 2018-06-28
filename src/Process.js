const { SchedulerInterrupt, QueueType } = require('./constants/index');

// A class representation of a process that may be blocking
// or non-blocking. We can specify how much CPU time a process
// needs in order to complete, or we can specify if the process
// is blocking; if so, the amount of blocking time needed is
// randomly determined.
class Process {
    constructor(pid, cpuTimeNeeded = null, blocking = false) {
        this._pid = pid;
        this.queue = null;
        this.cpuTimeNeeded = (cpuTimeNeeded !== null) ? cpuTimeNeeded : Math.round(Math.random() * 1000);
        this.blockingTimeNeeded = blocking ? Math.round(Math.random() * 100) : 0;
        // A bool representing whether this process was toggled from blocking to non-blocking or vice versa
        this.stateChanged = false;
    }

    setParentQueue(queue) {
        return this.queue = queue;
    }

    isFinished() {
        if (this.cpuTimeNeeded === 0 && this.blockingTimeNeeded === 0) {
            return true;
        } else {
            return false;
        }
    }

    // If no blocking time is needed by this process, decrement the amount of 
    // CPU time it needs by the input time
    // If blocking time is needed by this process, move it to the blocking queue
    // by emitting the appropriate interrupt
    // Make sure the `stateChanged` flag is toggled appropriately
    executeProcess(time) {
        if (this.blockingTimeNeeded > 0) {
            // this.stateChanged = true;
            // this.stateChanged = true;
            this.isStateChanged();
            this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED);
            // this.executeBlockingProcess(time + this.blockingTimeNeeded);
            this.setParentQueue(QueueType.BLOCKING_QUEUE);

        }
        console.log("This is the cpuTimeNeeded, and the time", this.cpuTimeNeeded, time);
        this.cpuTimeNeeded -= time;
        console.log("This is AFTER cpuTimeNeeded, and the time", this.cpuTimeNeeded, time);
        if (this.cpuTimeNeeded > 0) {
            this.queue.emitInterrupt(this, SchedulerInterrupt.LOWER_PRIORITY);
            // SchedulerInterrupt.LOWER_PRIORITY;
        }
        if (this.cpuTimeNeeded === 0) {
            // this.isStateChanged();
            // this.cpuTimeNeeded = 0;
            this.isFinished();
            return this.cpuTimeNeeded;
        } else if (this.cpuTimeNeeded < 0) {
            this.cpuTimeNeeded = 0;
            // this.isStateChanged();
            this.isFinished();
            return this.cpuTimeNeeded;
        }
    //    return this.executeProcess(time);
    }

    // If this process requires blocking time, decrement the amount of blocking
    // time it needs by the input time
    // Once it no longer needs to perform any blocking execution, move it to the 
    // top running queue by emitting the appropriate interrupt
    // Make sure the `stateChanged` flag is toggled appropriately
    executeBlockingProcess(time) {
        console.log("Execute Blocking Invoked, blockingTimeNeeded and time", this.blockingTimeNeeded, time);
        if (this.blockingTimeNeeded > 0) {
            console.log("blockingTimeNeeded", this.blockingTimeNeeded);
            this.blockingTimeNeeded -= time;
            console.log("AFTER blockingTimeNeeded", this.blockingTimeNeeded);
        };
        if (this.blockingTimeNeeded == 0) {
            // this.stateChanged = false;
            this.isStateChanged();
            // this.stateChanged = true;
            Queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_READY);
            // SchedulerInterrupt.PROCESS_READY;
            this.setParentQueue(QueueType.CPU_QUEUE);
        }
        if (this.blockingTimeNeeded < 0) {
            this.blockingTimeNeeded = 0;
            this.isStateChanged();
            Queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_READY);
            // SchedulerInterrupt.PROCESS_READY;
            this.setParentQueue(QueueType.CPU_QUEUE);
        }
        
        // this.executeBlockingProcess(time);

    }

    // Returns this process's stateChanged property
    isStateChanged() {
        // console.log("Is state invoked", this.stateChanged);
        this.stateChanged ? !this.stateChanged : !this.stateChanged;
        //  if (this.stateChanged === false) {
        //      this.stateChanged = true;
        //  } else {
        //      this.stateChanged = false;
        //  }
        // console.log("Is state invoked After", this.stateChanged);
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
