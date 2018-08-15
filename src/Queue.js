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
    this.processes.push(process);
    process.setParentQueue(this);
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
    } else {
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
      } else {
        this.quantumClock = time;
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

  // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
  // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
  // The process also needs to be removed from the queue
  emitInterrupt(source, interrupt) {}
}

module.exports = Queue;
