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
    while (true) {
      // loop inifinitely until all queues are empty
      const time = Date.now(); // current time
      const workTime = time - this.clock; // time elapsed since last loop - given to process
      this.clock = time;

      // check block queue for processes
      if (!this.blockingQueue.isEmpty()) {
        this.blockingQueue.doBlockingWork(workTime);
      }

      // do some work on the running queues
      for (let i = 0; i < PRIORITY_LEVELS; i++) {
        const queue = this.runningQueues[i];
        if (!queue.isEmpty()) {
          queue.doCPUWork(workTime);
          break; // go to the next iteration of the while loop
        }
      }

      // check all queues
      if (this.allQueuesEmpty()) {
        break; // exit loop as soon as all processes are finished
      }
    }
  }

  allQueuesEmpty() {
    let emptyQueues = 0;
    for (let i = 0; i < this.runningQueues.length; i++) {
      if (this.runningQueues[i].processes.length === 0) {
        emptyQueues++;
      }
    }
    return emptyQueues === this.runningQueues.length;
  }

  addNewProcess(process) {
    // add a new process to the highest priority queue
    this.runningQueues[0].enqueue(process);
  }

  // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
  // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
  handleInterrupt(queue, process, interrupt) {
    const runningQlen = this.runningQueues.length;
    const blockingQlen = this.blockingQueue.length;
    switch (interrupt) {
      case "PROCESS_BLOCKED":
        this.blockingQueue.enqueue(process);
        break;
      case "PROCESS_READY":
        this.addNewProcess(process);
        break;
      case "LOWER_PRIORITY":
        // non-blocking process - moved to lower priority queue
        if (queue.getQueueType() === QueueType.CPU_QUEUE) {
          // move to the next lower priority queue
          const priorityLevel = Math.min(
            PRIORITY_LEVELS - 1, // special case: process could already be in the lowest priority queue
            queue.getPriorityLevel() + 1 // generally the next lowest priority
          );
          this.runningQueues[priorityLevel].enqueue(process);
        } else {
          this.blockingQueue.enqueue(process);
        }
        break;
      default:
        break;
    }
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
