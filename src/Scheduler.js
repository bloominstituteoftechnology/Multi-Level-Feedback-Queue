const Queue = require("./Queue");
const { QueueType, PRIORITY_LEVELS } = require("./constants/index");

// A class representing the scheduler
// It holds a single blocking queue for blocking processes and three running queues
// for non-blocking processes
class Scheduler {
  constructor() {
    this.clock = Date.now();
    this.blockingQueue = new Queue(this, 50, 0, QueueType.BLOCKING_QUEUE);
    this.runningQueues = [];
    // Initialize all the CPU running queues
    for (let i = 0; i < PRIORITY_LEVELS; i++) {
      this.runningQueues[i] = new Queue(
        this,
        10 + i * 20,
        i,
        QueueType.CPU_QUEUE
      );
    }
  }

  // Executes the scheduler in an infinite loop as long as there are processes in any of the queues
  // Calculate the time slice for the next iteration of the scheduler by subtracting the current
  // time from the clock property. Don't forget to update the clock property afterwards.
  // On every iteration of the scheduler, if the blocking queue is not empty, blocking work
  // should be done. Once the blocking work has been done, perform some CPU work in the same iteration.
  run() {
    // while (this.blockingQueue != 0 || this.runningQueues.length != 0) {
    //   let seconds = new Date().getTime() / 1000;
    //   let timeSlice = seconds - this.clock;
    //   return;
    // }
  }

  allQueuesEmpty() {
    for (let i = 0; i < PRIORITY_LEVELS; i++) {
      if (this.runningQueues[i].processes.length > 0) {
        return false; // false if any of the arrays is not empty
      }
    }
    return true; // true if all arrays are empty
  }

  addNewProcess(process) {
    return this.runningQueues[process._pid].processes.push(process); // use pid of process to sort to appropriate array
  }

  // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
  // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
  handleInterrupt(queue, process, interrupt) {
    console.log("queue", queue);
    console.log("process", process);
    console.log("interrupt", interrupt);
    // console.log(this.runningQueues);
    if (interrupt == "PROCESS_BLOCKED") {
      queue.processes.push(process);
    }
    if (interrupt == "PROCESS_READY") {
      // process ready
    }
    if (interrupt == "LOWER_PRIORITY") {
      // lower priority
    }
    console.log("post-queue", queue);
    console.log("post-process", process);
    console.log("post-interrupt", interrupt);
    // console.log(this.blockingQueue.scheduler);
  }

  // Private function used for testing; DO NOT MODIFY
  _getCPUQueue(priorityLevel) {
    return this.runningQueues[priorityLevel];
  }

  // Private function used for testing; DO NOT MODIFY
  _getBlockingQueue() {
    return this.blockingQueue;
  }
}

module.exports = Scheduler;
