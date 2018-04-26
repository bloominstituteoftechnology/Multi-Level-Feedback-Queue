const Queue = require('./Queue');
const { QueueType, PRIORITY_LEVELS } = require('./constants/index');

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
    // let nextTimeSlice = Date.now() - this.clock;
    // while (!this.allQueuesEmpty) {
    //     if (this.blockingQueue.length > 0) {
    //         this.blockingQueue[0]
    //     }
    // }
    }

    allQueuesEmpty() {
        let isEmpty = true;
        if (this.blockingQueue.processes.length > 0) {
            isEmpty = false;
        }

        this.runningQueues.forEach(q => {
            if (q.processes.length > 0) {
                isEmpty = false;
            }
        });

        return isEmpty;
    }

    addNewProcess(process) {
        if (process.blockingTimeNeeded > 0) {
            this.blockingQueue.processes.push(process);
        } else {
            this.runningQueues[0].enqueue(process);
        }
    }

  // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
  // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
    handleInterrupt(queue, process, interrupt) {
        if (interrupt === 'PROCESS_BLOCKED') {
            this.blockingQueue.enqueue(process);
        } else if (interrupt === 'PROCESS_READY') {
            this.addNewProcess(process);
        } else if (interrupt === 'LOWER_PRIORITY') {
            if (process.blockingTimeNeeded === 0) {
                let newQueue =
                    queue.priorityLevel === PRIORITY_LEVELS - 1
                    ? PRIORITY_LEVELS - 1
                    : queue.priorityLevel + 1;
                this.runningQueues[newQueue].enqueue(process);
            } else {
                this.blockingQueue.enqueue(process);
            }
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
