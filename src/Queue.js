// Queue
const { SchedulerInterrupt } = require('./constants/index');

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
    // process.setParentQueue(this.queueType);
    process.setParentQueue(this);
    return this.processes.push(process);
  }

  // Removes the least-recently added process from the list of processes
  // Return the newly-removed process
  dequeue() {
    const currentProcess = this.processes.shift();
    return currentProcess;
  }

  // Return the least-recently added process without removing it from the list of processes
  peek() {
    return this.processes[0];
  }

  // Checks to see if there are any processes in the list of processes
  isEmpty() {
    const length = this.processes.length;
    if (length === 0) {
      return true;
    }
    return false;
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
  // If it is, we don't want to give the process any time; reset `this.quantumClock` and return
  // Otherwise, increment `this.quantumClock` by `time`
  // Check to see if `this.quantumClock` is greater than `this.quantum`
  // If it is, then we need to execute the next process in the queue
  // Set `this.quantumClock` to 0
  // Dequeue the next process from the queue
  // If it isn't finished, emit a scheduler interrupt notifying the scheduler that this process
  // needs to be moved to a lower priority queue
  manageTimeSlice(currentProcess, time) {
    if (currentProcess.isStateChanged() === true) {
      this.quantumClock = 0;
      return;
    } else {
      this.quantumClock = this.quantumClock + time;
      if (this.quantumClock > this.quantum) {
        this.quantumClock = 0;
        const proc = this.dequeue();
      } else {
        const sched = this.scheduler;
        sched.emitInterrupt(this.priorityLevel, currentProcess, SchedulerInterrupt.LOWER_PRIORITY);
      }
    }
  }

  // Execute a non-blocking process
  // Peeks the next process and runs its `executeProcess` method with input `time`
  // Call `this.manageTimeSlice` with the peeked process and input `time`
  doCPUWork(time) {
    const currentProc = this.peek();
    currentProc.executeProcess(time);
    this.manageTimeSlice(currentProc, time);
  }

  // Execute a blocking process
  // Peeks the next process and runs its `executeBlockingProcess` method with input `time`
  // Call `this.manageTimeSlice` with the peeked process and input `time`
  doBlockingWork(time) {
    const peeked = this.peek();
    peeked.executeBlockingProcess(time);
    this.manageTimeSlice(peeked, time);
  }

  // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
  // Receives a source process and an interrupt string
  // Find the index of the source process in `this.processes` and splice the process out of the array
  // In the case of a PROCESS_BLOCKED interrupt, emit the appropriate scheduler interrupt
  // In the case of a PROCESS_READY interrupt, emit the appropriate scheduler interrupt
  emitInterrupt(source, interrupt) {
    for (let i = 0; i < this.processes.length; i++) {
      if (this.processes[i] === source) {
        const toBeMoved = this.processes.splice(i, 1);
        const sched = this.scheduler;
        if (interrupt === SchedulerInterrupt.PROCESS_BLOCKED) {
          sched.emitInterrupt(this.queueType, source, SchedulerInterrupt.PROCESS_BLOCKED);
        } else if (interrupt === SchedulerInterrupt.PROCESS_READY) {
          sched.emitInterrupt(this.queueType, source, SchedulerInterrupt.PROCESS_READY);
        }
      }
    }
  }
}

module.exports = Queue;
