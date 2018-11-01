const Queue = require("./Queue");
const { QueueType, PRIORITY_LEVELS } = require("./constants/index");

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
    while (true) {
      const currentTime = Date.now();
      const deltaTime = currentTime - this.clock;

      if (!this.blockingQueue.isEmpty()) {
        this.blockingQueue.doBlockingWork(deltaTime);
      } else {
        for (let i = 0; i < PRIORITY_LEVELS; i++) {
          if (!this.runningQueues[i].isEmpty())
            this.runningQueues[i].doCPUWork(deltaTime);
        }
      }
      if (this.allQueuesEmpty()) {
        console.log("Success");
        break;
      }
      this.clock = currentTime;
    }
  }

  allQueuesEmpty() {
    return (
      this.runningQueues.every(queue => queue.isEmpty()) &&
      this.blockingQueue.isEmpty()
    );
  }

  addNewProcess(process) {
    this.runningQueues[0].enqueue(process);
  }

  handleInterrupt(queue, process, interrupt) {
    switch (interrupt) {
      case "PROCESS_BLOCKED":
        this.blockingQueue.enqueue(process);
        break;
      case "PROCESS_READY":
        this.addNewProcess(process);
        break;
      case "LOWER_PRIORITY":
        if (queue.getQueueType() === QueueType.BLOCKING_QUEUE)
          this.blockingQueue.enqueue(process);
        else {
          const priority = queue.getPriorityLevel();
          if (priority === PRIORITY_LEVELS - 1) {
            queue.enqueue(process);
            break;
          } else {
            this.runningQueues[priority + 1].enqueue(process);
          }
        }
        break;
      default:
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
