const Queue = require('./Queue');
const {
    SchedulerInterrupt,
    QueueType,
    PRIORITY_LEVELS,
} = require('./constants/index');

// A class representing the scheduler
// It holds a single blocking queue for blocking processes and three running queues 
// for non-blocking processes
class Scheduler {
    constructor() {
        this.clock = Date.now(); // log the time that the last iteration finished  
        this.blockingQueue = new Queue(this, 50, 0, QueueType.BLOCKING_QUEUE);
        this.runningQueues = [];
        // Initialize all the CPU running queues
        for (let i = 0; i < PRIORITY_LEVELS; i++) {
            this.runningQueues[i] = new Queue(this, 10 + i * 20, i, QueueType.CPU_QUEUE);
        }
    }

    // On every iteration of the scheduler, if the blocking queue is not empty, blocking work
    // should be done. Once the blocking work has been done, perform some CPU work in the same iteration.

    run() { // represents the entire thing running
        while (true) { // Executes the scheduler in an infinite loop as long as there are processes in any of the queues

            const time = Date.now();
                // Calculate the time slice for the next iteration of the scheduler by subtracting the current
                // time from the clock property.
                // represents how much time from the last iteration has elapsed with the time right now/ current time
            const timeSlice = time - this.clock; 
                // Don't forget to update the clock property afterwards.
            this.clock = time;

            if (!this.blockingQueue.isEmpty()) { // if blocking queue is not empty
                this.blockingQueue.doBlockingWork(timeSlice); // call doBlocingWork with time slice/ input
            }

            for (let i = 0; i < PRIORITY_LEVELS; i++) {
                const queue = this.runningQueues[i]; // grab the running queue
                if (!queue.isEmpty()) { 
                    queue.doCPUWork(timeSlice);
                    break; 
                }
            }

            if (this.allQueuesEmpty()) { // checking if all queues are empty
                console.log('Done!');
                break;
            }
        }
    }

    allQueuesEmpty() {
        return this.runningQueues.every((queue) => queue.isEmpty()) && this.blockingQueue.isEmpty(); // use every array method; takes in a call back on every element in the array of the running queue
    }

    addNewProcess(process) {
        this.runningQueues[0].enqueue(process);
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
