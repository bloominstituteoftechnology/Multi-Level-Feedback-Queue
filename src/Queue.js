const {
  SchedulerInterrupt
} = require('./constants/index');

// A class representation of a process queue that may hold either
// blocking or non-blocking processes
class Queue {
  constructor(scheduler, quantum, priorityLevel, queueType) {
    this.processes = [];
    // The queue's priority level; the lower the number, the higher the priority
    this.priorityLevel = priorityLevel;
    // The queue's parent scheduler
    this.scheduler = scheduler;
    // The queue's allotted time slice; each process in this queue is executed for this amount of time
    this.quantum = quantum;
    // A counter to keep track of how much time the queue has been executing so far
    this.quantumClock = 0;
    this.queueType = queueType;
  }

  // Adds the input process to the queue's list of processes
  // Also sets the input process's parent queue to this queue
  // Return the newly added process
  enqueue(process) {
    process.setParentQueue(this);
    return this.processes.push(process);
  }

  // Removes the least-recently added process from the list of processes
  // Return the newly-removed process
  dequeue() {
    return this.processes.shift();
  }

  // Return the least-recently added process without removing it from the list of processes
  peek() {
    return this.processes[0];
  }

  // Checks to see if there are any processes in the list of processes
  isEmpty() {
    return this.processes.length === 0;
  }

  // Return this queue's priority level
  getPriorityLevel() {
    return this.priorityLevel;
  }

  // Return this queue's queueType
  getQueueType() {
    return this.queueType;
  }

  // Manages a process's execution for the appropriate amount of time
  // Checks to see if currentProcess's `this.stateChanged` property is true
  // If it is, reset `this.quantumClock` to give the process more time and return
  // Otherwise, increment `this.quantumClock` by `time`
  // Check to see if `this.quantumClock` is greater than `this.quantum`
  // If it is, remove the current process from its queue to make way for the next process in line
  // Set `this.quantumClock` to 0
  // Dequeue the next process from the queue
  // If it isn't finished, emit a scheduler interrupt notifying the scheduler that this process
  // needs to be moved to a lower priority queue
  manageTimeSlice(currentProcess, time) {
    if (currentProcess.isStateChanged()) {
      this.quantumClock = 0;
      return;
    }

    this.quantumClock += time;
    if (this.quantumClock > this.quantum) {
      this.quantumClock = 0;
      const process = this.dequeue();

      if (!process.isFinished()) {
        this.scheduler.handleInterrupt(this, process, SchedulerInterrupt.LOWER_PRIORITY);
      }
    }
  }

  // Execute a non-blocking process
  // Peeks the next process and runs its `executeProcess` method with input `time`
  // Call `this.manageTimeSlice` with the peeked process and input `time`
  doCPUWork(time) {
    const process = this.peek();

    process.executeProcess(time);

    this.manageTimeSlice(process, time);
  }

  // Execute a blocking process
  // Peeks the next process and runs its `executeBlockingProcess` method with input `time`
  // Call `this.manageTimeSlice` with the peeked process and input `time`
  doBlockingWork(time) {
    const process = this.peek();

    process.executeBlockingProcess(time);

    this.manageTimeSlice(process, time);
  }

  // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
  // Receives a source process and an interrupt string
  // Find the index of the source process in `this.processes` and splice the process out of the array
  // In the case of a PROCESS_BLOCKED interrupt, emit the appropriate scheduler interrupt to the scheduler's interrupt handler
  // In the case of a PROCESS_READY interrupt, emit the appropriate scheduler interrupt to the scheduler's interrupt handler
  emitInterrupt(source, interrupt) {
    const index = this.processes.indexOf(source);
    this.processes.splice(index, 1);
    switch (interrupt) {
      case 'PROCESS_BLOCKED':
        this.scheduler.handleInterrupt(this, source, SchedulerInterrupt.PROCESS_BLOCKED);
        break;
      case 'PROCESS_READY':
        this.scheduler.handleInterrupt(this, source, SchedulerInterrupt.PROCESS_READY);
        break;
      default:
        break;
    }
  }
}

module.exports = Queue;