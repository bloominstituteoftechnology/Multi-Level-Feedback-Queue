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
      return;
    }

    this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED);
    this.stateChanged = !this.stateChanged;
  }

  executeBlockingProcess(time) {
    this.blockingTimeNeeded =
      time > this.blockingTimeNeeded ? 0 : this.blockingTimeNeeded - time;
    
    if (this.blockingTimeNeeded === 0) {
      this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_READY);
      this.stateChanged = !this.stateChanged;
    }
  }

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
