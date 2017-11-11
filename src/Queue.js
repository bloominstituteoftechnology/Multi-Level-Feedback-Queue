const { SchedulerInterrupt } = require('./constants/index');

class Queue {
  constructor(scheduler, quantum, priorityLevel, queueType) {
    this.processes = [];
    this.priorityLevel = priorityLevel;
    this.scheduler = scheduler;
    this.quantum = quantum;
    this.quantumClock = 0;
    this.queueType = queueType;
  }

  manageTimeSlice(currentProcess, time) {
    if (currentProcess.isStateChanged()) return this.quantumClock = 0;

    this.quantumClock += time;
    if (this.quantumClock >= this.quantum) {
      this.quantumClock = 0;
      const process = this.dequeue();

      if (!process.isFinished())
        this.scheduler.handleInterrupt(this, process, SchedulerInterrupt.LOWER_PRIORITY);
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

  isEmpty() {
    return !this.processes.length;
  }

  emitInterrupt(source, interrupt) {
    this.processes.splice(this.processes.indexOf(source), 1);
    this.scheduler.handleInterrupt(this, source, interrupt);
  }

  enqueue(process) {
    process.setParentQueue(this);
    return this.processes.push(process);
  }

  dequeue() {
    return this.processes.shift();
  }

  peek() {
    return this.processes[0];
  }

  getPriorityLevel() {
    return this.priorityLevel;
  }

  getQueueType() {
    return this.queueType;
  }
}

module.exports = Queue;
