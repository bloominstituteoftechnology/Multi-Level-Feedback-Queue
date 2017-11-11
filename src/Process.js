const { SchedulerInterrupt } = require('./constants/index');

class Process {
  constructor(pid, cpuTimeNeeded = null, blocking = false) {
    this._pid = pid;
    this.queue = null;
    this.cpuTimeNeeded = cpuTimeNeeded
      ? cpuTimeNeeded
      : Math.round(Math.random() * 1000);
    this.blockingTimeNeeded = blocking ? Math.round(Math.random() * 100) : 0;
    this.stateChanged = false;
  }

  setParentQueue(queue) {
    this.queue = queue;
  }

  isFinished() {
    return this.cpuTimeNeeded <= 0 && this.blockingTimeNeeded <= 0;
  }

  executeProcess(time) {
    this.stateChanged = false;
    if (this.blockingTimeNeeded <= 0) {
      this.cpuTimeNeeded -= time;
    } else {
      this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_BLOCKED);
      this.stateChanged = true;
    }
  }

  executeBlockingProcess(time) {
    this.blockingTimeNeeded -= time;
    if (this.blockingTimeNeeded <= 0) {
      this.queue.emitInterrupt(this, SchedulerInterrupt.PROCESS_READY);
      this.stateChanged = true;
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
