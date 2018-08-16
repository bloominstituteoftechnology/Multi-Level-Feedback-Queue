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

  run() {
    while (!this.allQueuesEmpty()) {
      const time = Date.now() - this.clock;
      this.clock = Date.now();

      if (!this.blockingQueue.isEmpty()) {
        this.blockingQueue.doBlockingWork(time);
      }

      for (let i = 0; i < PRIORITY_LEVELS; i++) {
        if (!this.runningQueues[i].isEmpty()) {
          this.runningQueues[i].doCPUWork(time);
          break;
        }
      }
    }
  }

  allQueuesEmpty() {
    return (
      this.blockingQueue.isEmpty() &&
      this.runningQueues.every(queue => queue.isEmpty())
    );
  }

  addNewProcess(process) {
    this.runningQueues[0].enqueue(process);
  }

  handleInterrupt(queue, process, interrupt) {
    switch (interrupt) {
      case SchedulerInterrupt.PROCESS_BLOCKED:
        this.blockingQueue.enqueue(process);
        break;

      case SchedulerInterrupt.PROCESS_READY:
        this.addNewProcess(process);
        break;

      case SchedulerInterrupt.LOWER_PRIORITY:
        if (queue.getQueueType() === QueueType.BLOCKING_QUEUE) {
          this.blockingQueue.enqueue(process);
        } else {
          const currQueue = queue.getPriorityLevel();
          const lowestQueue = PRIORITY_LEVELS - 1;
          const nextQueue =
            currQueue === lowestQueue ? lowestQueue : currQueue + 1;
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
