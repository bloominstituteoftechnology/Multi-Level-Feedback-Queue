const Queue = require('./Queue'); 
const { 
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
        while (!this.allEmpty()) {
            // If a process is found:
            // Do non-blocking work for the amount of time specified for the current iteration
            // If the process becomes blocking:
            //     Emit an interrupt to the scheduler notifying it that the process has become blocking
            //     The scheduler removes the now-blocking process from the CPU queue
            //     Places it on the blocking queue
            //     Restarts the time quantum with the next process in the CPU queue

            // If the end of the time quantum has been reached:
            //     Remove the process that is currently being worked on from the top of the CPU queue
            //     If the process is not finished:
            //         If the process is already in the lowest priority queue:
            //             Add it to the back of the same queue
            //         Else:
            //             Add the process to the back of the next lower priority queue
            //     Break out of the current iteration and continue looping
        }
    }

    allEmpty() {
        if (this.blockingQueue.length > 0) return false;
        for (let i = 0; i < PRIORITY_LEVELS; i++) {
            if (this.runningQueues[i].length > 0) return false;
        }
        return true;
    }

    addNewProcess(process) {
        this.runningQueues[process.priorityLevel].enqueue(process);
    }

    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
    handleInterrupt(queue, process, interrupt) {
        switch(interrupt) {
            case PROCESS_BLOCKED:
                this.blockingQueue.enqueue(process);
                break;
            case PROCESS_READY:
                this.addNewProcess(process);
                break;
            case LOWER_PRIORITY:
                if (process.stateChanged) this.blockingQueue.enqueue(queue.dequeue());
                else if (queue.priorityLevel === 3) queue.enqueue(queue.dequeue());
                else this.runningQueues[queue.priorityLevel + 1].enqueue(queue.dequeue());
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
