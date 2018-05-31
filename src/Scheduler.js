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
        this.clock = Date.now();
        this.blockingQueue = new Queue(this, 50, 0, QueueType.BLOCKING_QUEUE);
        this.runningQueues = [];
        // Initialize all the CPU running queues
        for (let i = 0; i < PRIORITY_LEVELS; i++) {
            this.runningQueues[i] = new Queue(this, 10 + i * 20, i, QueueType.CPU_QUEUE);
        }
    }

    // Executes the scheduler in an infinite loop as long as there are processes in any of the queues
    // Calculate the time slice for the next iteration of the scheduler by subtracting the current
    // time from the clock property. Don't forget to update the clock property afterwards.
    // On every iteration of the scheduler, if the blocking queue is not empty, blocking work
    // should be done. Once the blocking work has been done, perform some CPU work in the same iteration.
    run() {

    }

    allQueuesEmpty() {
        if(!this.blockingQueue.isEmpty()) {
            return false;
        }

        for(let i = 0; i < PRIORITY_LEVELS; i++) {
            if(!this.runningQueues[i].isEmpty()) {
                return false;
            }
        }

        return true;
    }

    addNewProcess(process) {
        this.runningQueues[0].enqueue(process);
    }

    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
    handleInterrupt(queue, process, interrupt) {
        if(interrupt === SchedulerInterrupt.PROCESS_BLOCKED) {
            process.stateChanged = false;
            this.blockingQueue.enqueue(process);
        } else if(interrupt === SchedulerInterrupt.PROCESS_READY) {
            process.stateChanged = false;
            this.addNewProcess(process);
        } else if(interrupt === SchedulerInterrupt.LOWER_PRIORITY) {
            process.stateChanged = false;

            if(process.blockingTimeNeeded > 0) {
                this.blockingQueue.dequeue();
                this.blockingQueue.enqueue(process);
            } else {
                const newLevel = queue.priorityLevel < PRIORITY_LEVELS-1 ? queue.priorityLevel+1 : queue.priorityLevel;
                this.runningQueues[newLevel].enqueue(process);
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
