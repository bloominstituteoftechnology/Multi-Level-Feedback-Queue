const { SchedulerInterrupt } = require('./constants/index');

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
    this.blockingTimeNeeded = blocking ? Math.round(Math.random() * 100) : 0;
    this.stateChanged = false; // blocking/non-blocking toggle
  }

  setParentQueue(queue) {
    this.queue = queue;
  }

  isFinished() {
    return this.cpuTimeNeeded === 0 && this.blockingTimeNeeded === 0
      ? true
      : false;
  }

  executeProcess(time) {
    if (this.blockingTimeNeeded === 0) {
      this.cpuTimeNeeded =
        time > this.cpuTimeNeeded ? 0 : this.cpuTimeNeeded - time;
    } else {
      this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED);
      this.stateChanged = !this.stateChanged;
    }
  }

  // If this process requires blocking time, decrement the amount of blocking
  // time it needs by the input time
  // Once it no longer needs to perform any blocking execution, move it to the
  // top running queue by emitting the appropriate interrupt
  // Make sure the `stateChanged` flag is toggled appropriately
  executeBlockingProcess(time) {}

  isStateChanged() {
    return this.stateChanged;
  }

  get pid() {
    return this._pid;
  }

  _getParentQueue() {
    return this.queue;
  }
}

module.exports = Process;
