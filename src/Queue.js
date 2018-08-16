const { SchedulerInterrupt, QueueType } = require('./constants/index');

// A class representation of a process queue that may hold either a
// blocking or non-blocking process
class Queue {
  constructor(scheduler, quantum, priorityLevel, queueType) {
    this.processes = [];
    this.priorityLevel = priorityLevel;
    this.scheduler = scheduler;
    this.quantum = quantum;
    this.quantumClock = 0; // How long the queue has been executing
    this.queueType = queueType;
  }

  enqueue(process) {
    process.setParentQueue(this);
    this.processes.push(process);
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
    
    this.quantumClock = time;

    if (time > this.quantum) {
      this.quantumClock = 0;
      this.dequeue();
      if (!currentProcess.isFinished()) {
        this.scheduler.handleInterrupt(
          this,
          currentProcess,
          SchedulerInterrupt.LOWER_PRIORITY
        );
      }
    }
  }

  doCPUWork(time) {
    if (this.queueType === QueueType.CPU_QUEUE) {
      const currentProcess = this.peek();
      currentProcess.executeProcess(time);
      this.manageTimeSlice(currentProcess, time);
    }
  }

  doBlockingWork(time) {
    if (this.queueType === QueueType.BLOCKING_QUEUE) {
      const currentProcess = this.peek();
      currentProcess.executeBlockingProcess(time);
      this.manageTimeSlice(currentProcess, time);
    }
  }

  emitInterrupt(source, interrupt) {
    this.processes = this.processes.filter(
      process => process.pid !== source.pid
    );
    this.scheduler.handleInterrupt(this, source, interrupt);
  }
}

module.exports = Queue;
