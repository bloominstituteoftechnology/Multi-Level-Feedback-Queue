const { SchedulerInterrupt } = require('./constants/index');

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

  // Manages a process's execution for the given amount of time
  // Processes that have had their states changed should not be affected
  // Once a process has received the alloted time, it needs to be dequeue'd and 
  // then handled accordingly, depending on whether it has finished executing or not
  manageTimeSlice(currentProcess, time) {

  }

  // Execute the next non-blocking process (assuming this is a CPU queue)
  // This method should call `manageTimeSlice` as well as execute the next running process
  doCPUWork(time) {

  }

  // Execute the next blocking process (assuming this is the blocking queue)
  // This method should call `manageTimeSlice` as well as execute the next blocking process
  doBlockingWork(time) {

  }

  // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
  // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
  // The process also needs to be removed from the queue
  emitInterrupt(source, interrupt) {

  }
}

module.exports = Queue;
