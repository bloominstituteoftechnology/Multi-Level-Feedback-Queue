const { SchedulerInterrupt } = require("./constants/index");

// A class representation of a process queue that may hold either a
// blocking or non-blocking process
class Queue {
  constructor(scheduler, quantum, priorityLevel, queueType) {
    this.processes = [];
    // The queue's priority level; the lower the number, the higher the priority
    this.priorityLevel = priorityLevel;
    // The queue's parent scheduler
    this.scheduler = scheduler;
    // The queue's allotted time slice; each process in this queue is executed for this amount of time in total
    // This may be done over multiple scheduler iterations
    this.quantum = quantum;
    // A counter to keep track of how much time the queue has been executing so far
    this.quantumClock = 0;
    this.queueType = queueType;
  }

  // Enqueues the given process. Return the enqueue'd process
  enqueue(process) {
    process.setParentQueue(this);
    return this.processes.push(process);
  }

  // Dequeues the next process in the queue. Return the dequeue'd process
  dequeue() {
    return this.processes.shift();
  }

  // Return the least-recently added process without removing it from the list of processes
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
    if (currentProcess.isStateChanged()) {
      // state change -> unaffected
      this.quantumClock = 0;
    } else {
      this.quantumClock = this.quantumClock + time; // time for process to execute
      // If process uses alloted time, dequeue + reset quantumClock
      if (this.quantumClock >= this.quantum) {
        this.dequeue();
        this.quantumClock = 0;

        // If process done console.log
        // Else lower process priority
        if (currentProcess.isFinished()) {
          console.log("Proccess Finished");
        } else {
          // Scheduler lowers priority
          this.scheduler.handleInterrupt(
            this,
            currentProcess,
            SchedulerInterrupt.LOWER_PRIORITY
          );
        }
      }
    }
  }

  // Execute the next non-blocking process (assuming this is a CPU queue)
  // This method should call `manageTimeSlice` as well as execute the next running process
  doCPUWork(time) {}

  // Execute the next blocking process (assuming this is the blocking queue)
  // This method should call `manageTimeSlice` as well as execute the next blocking process
  doBlockingWork(time) {}

  // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
  // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
  // The process also needs to be removed from the queue
  emitInterrupt(source, interrupt) {
    // Index of running process
    let sourceIndex = this.processes.indexOf(source);

    // Remove process from queue
    this.processes.splice(1, sourceIndex);

    // Pass to handleInterrupt for switch cases
    this.scheduler.handleInterrupt(this, source, interrupt);
  }
}

module.exports = Queue;
