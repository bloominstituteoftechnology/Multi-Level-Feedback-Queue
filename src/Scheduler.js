const Queue = require('./Queue');
const {
    QueueType,
    PRIORITY_LEVELS,
    SchedulerInterrupt,
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
        while (true) {
            // log the current time 
            const time = Date.now();
            // take the difference between the current time and the 
            // time logged by the last loop iteration
            const workTime = time - this.clock;
            // update this.clock
            this.clock = time;

            // check the block queue to see if there are any processes there
            if (!this.blockingQueue.isEmpty()) {
                this.blockingQueue.doBlockingWork(workTime);
            }

            // do some work on the running queues
            for (let i = 0; i < PRIORITY_LEVELS; i++) {
                const queue = this.runningQueues[i];
                if (!queue.isEmpty()) {
                    queue.doCPUWork(workTime);
                    break;
                }
            }

            // check if all the queues are empty
            if (this.allQueuesEmpty()) {
                console.log("Idle mode");
                break;
            }
        }
    }

    allQueuesEmpty() {
        return this.runningQueues.every((queue) => queue.isEmpty()) && this.blockingQueue.isEmpty();
    }

    addNewProcess(process) {
        // new processes will only ever get added to the top-level running queue
        this.runningQueues[0].enqueue(process);
    }

    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
    handleInterrupt(queue, process, interrupt) {
        switch (interrupt) {
            case SchedulerInterrupt.PROCESS_BLOCKED:
                this.blockingQueue.enqueue(process);
                break;
            case SchedulerInterrupt.PROCESS_READY:
                this.addNewProcess(process);
                break;
            case SchedulerInterrupt.LOWER_PRIORITY:
                if (queue.getQueueType() === QueueType.CPU_QUEUE) {
                    // move to the next priority queue
                    // figure out the priority level of the next queue
                    // remember to handle the case where the process is already in the lowest 
                    // priority queue
                    const priorityLevel = Math.min(PRIORITY_LEVELS - 1, queue.getPriorityLevel() + 1);
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