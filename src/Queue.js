const { SchedulerInterrupt } = require("./constants/index");

class Queue {
  constructor(scheduler, quantum, priorityLevel, queueType) {
    this.processes = [];

    this.priorityLevel = priorityLevel;

    this.scheduler = scheduler;

    this.quantum = quantum;

    this.quantumClock = 0;
    this.queueType = queueType;
  }

  enqueue(process) {
    process.setParentQueue(this);
    this.processes.push(process);
    return process;
  }

  dequeue() {
    return this.processes.shift();
  }

  peek() {
    return this.processes[0];
  }

  isEmpty() {
    return this.processes.length === 0;
  }

  getPriorityLevel() {
    return this.priorityLevel;
  }

  getQueueType() {
    return this.queueType;
  }

  manageTimeSlice(currentProcess, time) {
    if (currentProcess.isStateChanged()) {
      this.quantumClock = 0;
      return;
    }
    this.quantumClock += time;
    if (this.quantumClock >= this.quantum) {
      this.quantumClock = 0;
      this.dequeue();
      if (!currentProcess.isFinished())
        this.scheduler.handleInterrupt(
          this,
          currentProcess,
          SchedulerInterrupt.LOWER_PRIORITY
        );
    }
  }

  doCPUWork(time) {
    const process = this.peek();
    process.executeProcess(time);
    this.manageTimeSlice(process, time);
  }

  doBlockingWork(time) {
    const process = this.peek();
    process.executeBlockingProcess(time);
    this.manageTimeSlice(process, time);
  }

  emitInterrupt(source, interrupt) {
    const index = this.processes.indexOf(source);
    this.processes.splice(index, 1);
    if (interrupt === SchedulerInterrupt.PROCESS_BLOCKED)
      this.scheduler.handleInterrupt(
        this,
        source,
        SchedulerInterrupt.PROCESS_BLOCKED
      );
    else if (interrupt === SchedulerInterrupt.PROCESS_READY)
      this.scheduler.handleInterrupt(
        this,
        source,
        SchedulerInterrupt.PROCESS_READY
      );
  }
}

module.exports = Queue;
