const { SchedulerInterrupt } = require("./constants/index");

// A class representation of a process that may be blocking
// or non-blocking. We can specify how much CPU time a process
// needs in order to complete, or we can specify if the process
// is blocking; if so, the amount of blocking time needed is
// randomly determined.
class Process {
  constructor(pid, cpuTimeNeeded = null, blocking = false) {
    this._pid = pid;
    this.queue = null;
    this.cpuTimeNeeded =
      cpuTimeNeeded !== null ? cpuTimeNeeded : Math.round(Math.random() * 1000);
    // if blocking is true, specify the amount of blocking time needed randomly with Math.random()
    this.blockingTimeNeeded = blocking ? Math.round(Math.random() * 100) : 0;
    // A bool representing whether this process was toggled from blocking to non-blocking or vice versa
    this.stateChanged = false;
  }

  setParentQueue(queue) {
    // set this.queue from null to the queue passed into the method
    this.queue = queue;
  }

  isFinished() {
    // when the process is finished the process needs no CPU time and is not blocking/needs no blocking time
    return this.cpuTimeNeeded === 0 && this.blockingTimeNeeded === 0;
  }

  // If no blocking time is needed by this process, decrement the amount of
  // CPU time it needs by the input time
  // If blocking time is needed by this process, move it to the blocking queue
  // by emitting the appropriate interrupt
  // Make sure the `stateChanged` flag is toggled appropriately
  executeProcess(time) {
    // set stateChanged to be false in case we receive a process that used to be blocking and we want it to be running again it needs to be toggled back to false.
    this.stateChanged = false;
    // if no blocking time is needed by this process
    if (this.blockingTimeNeeded === 0) {
      // decrement the amount of CPU time it needs by the input time
      this.cpuTimeNeeded -= time;
      // check to see if the amount of decremented caused CPU time to be negative. If so, set number to 0.
      this.cpuTimeNeeded =
        this.cpuTimeNeeded > 0 ? this.cpuTimeNeeded : (this.cpuTimeNeeded = 0);
    } else {
      // blocking time needed by this process
      // move it to the blocking queue by emitting the appropriate interrupt passing in the reference to this process
      this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED);
      // toggle stateChanged to be true to signify a blocking process
      this.stateChanged = true;
    }
  }

  // If this process requires blocking time, decrement the amount of blocking
  // time it needs by the input time
  // Once it no longer needs to perform any blocking execution, move it to the
  // top running queue by emitting the appropriate interrupt
  // Make sure the `stateChanged` flag is toggled appropriately
  executeBlockingProcess(time) {
    // If this process requires blocking time
    // decrement the amount of blocking time it needs by the input time
    this.blockingTimeNeeded -= time;
    // check to see if the amount decremented caused blockingTimeNeeded to be negative. If so, set number to 0.
    this.blockingTimeNeeded =
      this.blockingTimeNeeded > 0
        ? this.blockingTimeNeeded
        : (this.blockingTimeNeeded = 0);

    if (this.blockingTimeNeeded === 0) {
      // no longer needs blocking time move it to the top of running queue by passing in a reference to this process and setting it to process ready
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

  // Private function used for testing; DO NOT MODIFY
  _getParentQueue() {
    return this.queue;
  }
}

module.exports = Process;
