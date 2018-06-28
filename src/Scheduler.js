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
    // while ther are processes in the ques or whiel the ues are not empty
    // while (!this.allQueuesEmpty()) {
    //   // subtracting the current time from the clock, and setting that into the clock variable,
    //   const currentSlice = Date.now() - this.clock;
    //   this.clock -= currentSlice;
    //   // check if the blocking queue is not empty.
    //   if (!this.blockingQueue.isEmpty()) {
    //     // when the blocking queue is not empty call do blocking work and pass in the time variable
    //     this.blockingQueue.doBlockingWork(this.clock);
    //   }
    //   // iterate over the running queues.

    //   for (let i = 0; i < this.runningQueues.length; i++) {
    //     // performing and if to check if running queues at the index of i is not empty
    //     if (!this.runningQueues[i].isEmpty()) {
    //       // if it is not then do cpu work at the index of i passing in the time variable
    //       this.runningQueues[i].doCPUWork(this.clock);
    //     }
    //   }
    // }
    while (true) {
        //log the current time
        const time = Date.now();
        // time logged by the last loop iteration
        const workTime = time - this.clock;
        this.clock = time;

        if (!this.blockingQueue.isEmpty()) {
            this.blockingQueue.doBlockingWork(workTime);
        }

        for (let i = 0; i < PRIORITY_LEVELS; i++) {
            const queue = this.runningQueues[i];
            if (!queue.isEmpty()) {
                queue.doCPUWork(workTime);
                break;
            }
        }

        if (this.aaaaallQueuesEmpty()) {
            break;
        }
}
  }

  allQueuesEmpty() {
    // iterate over the running queues array while i is less than it
    for (let i = 0; i < this.runningQueues.length; i++) {
      // if runningqueues at index of i is not empty
      if (!this.runningQueues[i].isEmpty()) {
        // return false if it is there are any ques that are not empty
        return false;
      }
    }
    // returns true if the blocking que is empty if all ques are empty, Hurrah!!
    return true;
  }

  addNewProcess(process) {
    this.runningQueues[0].enqueue(process);
  }

  // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
  // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
  handleInterrupt(queue, process, interrupt) {
    switch (interrupt) {
      // case for checking for the blocked interrupt
      case "PROCESS_BLOCKED":
        // if this case is true then enque into that
        this.blockingQueue.enqueue(process);
        break;
      // if the interrupt string passed in is PROCESS_READY
      case "PROCESS_READY":
        // call the addNewProcess method and pass in the process
        this.addNewProcess(process);
        break;
      // if the LOWER_PRIORITY intrerupt
      case "LOWER_PRIORITY":
        // if the que type matches blocking queue
        if (queue.getQueueType() === QueueType.BLOCKING_QUEUE) {
          // add the process to the que
          this.blockingQueue.enqueue(process);
        } else {
          // else the priority level is  equals priority levels minus one,
          if (queue.getPriorityLevel() === PRIORITY_LEVELS - 1) {
            // add in the process at the current process
            this.runningQueues[queue.getPriorityLevel()].enqueue(process);
          } else {
            // else add it too the the next priority level.
            this.runningQueues[queue.getPriorityLevel() + 1].enqueue(process);
          }
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
