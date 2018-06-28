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
    console.log(`run() called`);
    while (this.allQueuesEmpty() === false) {
      console.log("while loop for run() called");
      let currentTime = Date.now();
      let workTime = currentTime - this.clock;
      this.clock = currentTime;
      this.blockingQueue.doBlockingWork(workTime);
      for (let i = 0; i < this.runningQueues.length; i++) {
        this.runningQueues[i].doCPUWork(workTime);
      }
    }
    console.log(`run() FINISHED`);
  }

  allQueuesEmpty() {
    console.log(`allQueuesEmpty() called`);
    // if (this.runningQueues[0] === undefined) return true;
    if (this.blockingQueue.isEmpty() === false) return false;
    for (let i = 0; i < this.runningQueues.length; i++) {
      if (this.runningQueues[i].isEmpty() === false) {
        return false;
      }
    }
    return true;
  }

  addNewProcess(process) {
    console.log(`addNewProcess(${process._pid}) called`);
    this.runningQueues[0].enqueue(process);
  }

  // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
  // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
  handleInterrupt(queue, process, interrupt) {
    console.log(
      `handleInterrupt(${queue.priorityLevel}, ${
        process._pid
      }, ${interrupt}) called`
    );
    if (interrupt === "PROCESS_BLOCKED") {
      this.blockingQueue.enqueue(process);
    } else if (interrupt === "PROCESS_READY") {
      this.addNewProcess(process);
    } else if (interrupt === "LOWER_PRIORITY") {
      if (queue.priorityLevel === 2) {
        return;
      }
      for (let i = 0; i < this.runningQueues.length; i++) {
        if (this.runningQueues[i].priorityLevel > queue.priorityLevel) {
          this.runningQueues[i].enqueue(process);
          return;
        }
      }
    }
  }

  // Private function used for testing; DO NOT MODIFY
  _getCPUQueue(priorityLevel) {
    console.log(`_getCPUQueue(${priorityLevel}) called`);
    return this.runningQueues[priorityLevel];
  }

  // Private function used for testing; DO NOT MODIFY
  _getBlockingQueue() {
    console.log(`_getBlockingQueue() called`);
    return this.blockingQueue;
  }
}

module.exports = Scheduler;
