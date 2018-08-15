const Queue = require('./Queue');
const {
  QueueType,
  SchedulerInterrupt,
  PRIORITY_LEVELS
} = require('./constants/index');

// A class representing the scheduler
// It holds a single blocking queue for blocking processes and three running queues
// for non-blocking processes
class Scheduler {
  constructor() {
    this.clock = Date.now();
    this.blockingQueue = new Queue(this, 50, 0, QueueType.BLOCKING_QUEUE);
    this.runningQueues = [];

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
  run() {}

  allQueuesEmpty() {
    return (
      this.blockingQueue.isEmpty() &&
      this.runningQueues.reduce((acc, queue) => acc && queue.isEmpty(), true)
    );
  }

  addNewProcess(process) {
    const topQueue = this.runningQueues[0];
    topQueue.enqueue(process);
  }

  handleInterrupt(queue, process, interrupt) {
    switch (interrupt) {
      case SchedulerInterrupt.PROCESS_BLOCKED:
        queue.enqueue(process);
        break;

      case SchedulerInterrupt.PROCESS_READY:
        this.addNewProcess(process);
        break;

      case SchedulerInterrupt.LOWER_PRIORITY:
        if (
          queue === this.blockingQueue ||
          queue.getPriorityLevel() === PRIORITY_LEVELS - 1
        ) {
          queue.enqueue(process);
        } else {
          const nextQueue = queue.getPriorityLevel() + 1;
          this.runningQueues[nextQueue].enqueue(process);
        }
        break;
    }
  }

  _getCPUQueue(priorityLevel) {
    return this.runningQueues[priorityLevel];
  }

  _getBlockingQueue() {
    return this.blockingQueue;
  }
}

module.exports = Scheduler;
