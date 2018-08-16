const Queue = require('./Queue');
const { QueueType, PRIORITY_LEVELS } = require('./constants/index');
const BOOST_TIME = 1534463145708 * 8;

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
      this.runningQueues[i] = new Queue(this, 10 + i * 20, i, QueueType.CPU_QUEUE);
    }
    this.boostTime = BOOST_TIME;
  }

  // Executes the scheduler in an infinite loop as long as there are processes in any of the queues
  // Calculate the time slice for the next iteration of the scheduler by subtracting the current
  // time from the clock property. Don't forget to update the clock property afterwards.
  // On every iteration of the scheduler, if the blocking queue is not empty, blocking work
  // should be done. Once the blocking work has been done, perform some CPU work in the same iteration.
  run() {
    let runningAllotedTime = 0,
      newTime,
      currentQueueIndex = 0, // Set this value to point to the first queue
      itemsInCurrentQueueToLoop = this.runningQueues[currentQueueIndex].processes.length; // Set this value with the number of processes in the first queue.

    // console.log({ 'QUEUES EMPTY': this.allQueuesEmpty() });
    while (this.allQueuesEmpty() == false) {
      console.log('\n\n', { 'blocking-queue length': this.blockingQueue.processes.length });
      console.log({
        'CURRENT QUEUE': currentQueueIndex,
        length: this.runningQueues[currentQueueIndex].processes.length,
        itemsInCurrentQueueToLoop,
        newTime,
        'BOOST TIME': this.boostTime,
      });

      if (this.boostTime <= 0) {
        console.log('BOOSTING!');

        // Reset Boost time
        this.boostTime = BOOST_TIME;

        // if true -> move all processes to the high priority Queue
        for (let i = 1; i < this.runningQueues.length; i++) {
          if (!this.runningQueues[i].isEmpty()) {
            while (this.runningQueues[i].isEmpty()) {
              this.addNewProcess(this.runningQueues[i].dequeue());
            }
          }
        }
      }

      newTime = Date.now();
      runningAllotedTime = newTime - this.clock;
      this.clock = newTime;
      this.boostTime -= newTime;
      console.log({ boostTime: this.boostTime });

      // console.log('BEFORE IF BLOCKING');
      if (!this.blockingQueue.isEmpty()) {
        // console.log('INSIDE BLOCKING');
        // console.log({
        //   'BLOCKING QUEUE': '',
        //   length: this.blockingQueue.processes.length,
        // });
        this.blockingQueue.doBlockingWork(runningAllotedTime);
      }
      // console.log('AFTER BLOCKING');

      /* Set current Queue number of items to loop through. */
      // Reset this variable
      itemsInCurrentQueueToLoop = this.runningQueues[currentQueueIndex].processes.length;
      if (itemsInCurrentQueueToLoop > 0) {
        this.runningQueues[currentQueueIndex].doCPUWork(runningAllotedTime);
        // itemsInCurrentQueueToLoop--;
      } else if (itemsInCurrentQueueToLoop == 0) {
        // if there are no more items to loop through, then:
        // Go down a level in priority  (Move to a lower priority queue).
        // if the level is the lower one, jump back to the highest priority queue.
        currentQueueIndex = ++currentQueueIndex % PRIORITY_LEVELS;
      }
    }
  }

  allQueuesEmpty() {
    let areEmpty = true;
    for (let queue of this.runningQueues) {
      queue.isEmpty() == false && (areEmpty = false);
    }
    return areEmpty;
  }

  addNewProcess(process) {
    this.runningQueues[0].enqueue(process);
  }

  // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
  // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
  handleInterrupt(queue, process, interrupt) {
    // console.log({ queue, process, interrupt });
    const queueType = queue.getQueueType();
    const queuePriority = queue.getPriorityLevel();

    switch (interrupt) {
      case 'PROCESS_BLOCKED':
        this.blockingQueue.enqueue(process);
        break;
      case 'PROCESS_READY':
        this.addNewProcess(process);
        break;
      case 'LOWER_PRIORITY':
        queueType == QueueType.BLOCKING_QUEUE && queue.enqueue(process);

        if (queuePriority < PRIORITY_LEVELS - 1) {
          this.runningQueues[queuePriority + 1].enqueue(process);
        } else {
          this.runningQueues[queuePriority].enqueue(process);
        }
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

// run() {
//   let runningAllotedTime = 0,
//     newTime,
//     currentQueueIndex = 0, // Set this value to point to the first queue
//     itemsInCurrentQueueToLoop = this.runningQueues[currentQueueIndex].processes.length; // Set this value with the number of processes in the first queue.

//   while (this.allQueuesEmpty() == false) {
//     newTime = Date.now();
//     runningAllotedTime = newTime - this.clock;
//     this.clock = newTime;

//     if (!this.blockingQueue.isEmpty()) {
//       this.blockingQueue.doBlockingWork(runningAllotedTime);
//     }

//     /* Set current Queue number of items to loop through. */
//     // Reset this variable
//     itemsInCurrentQueueToLoop = this.runningQueues[currentQueueIndex].processes.length;
//     if (itemsInCurrentQueueToLoop > 0) {
//       this.runningQueues[currentQueueIndex].doCPUWork(runningAllotedTime);
//     } else if (itemsInCurrentQueueToLoop == 0) {
//       // if there are no more items to loop through, then:
//       // Go down a level in priority  (Move to a lower priority queue).
//       // if the level is the lower one, jump back to the highest priority queue.
//       currentQueueIndex = ++currentQueueIndex % PRIORITY_LEVELS;
//     }
//   }
// }
