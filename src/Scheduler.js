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
        //This is just logging the time when the scheduler is initialized
        this.blockingQueue = new Queue(this, 50, 0, QueueType.BLOCKING_QUEUE);
        this.runningQueues = [];
        // Initialize all the CPU running queues
        for (let i = 0; i < PRIORITY_LEVELS; i++) {
            this.runningQueues[i] = new Queue(this, 10 + i * 20, i, QueueType.CPU_QUEUE);
        }
    }


    run() {
    // Executes the scheduler in an infinite loop as long as there are processes in any of the queues
    while (this.runningQueues !== []) {

    }
    //       needs to have a while loop that logs the current time with Date.now() then figure out
    //         the work time (diff between the current time now, and last loop ran)
    //          so this is the ammount of time you feed into do blocking work, and do cpu work
    //           then log block to be current
    // Calculate the time slice for the next iteration of the scheduler by subtracting the current
    // time from the clock property. Don't forget to update the clock property afterwards.
    // On every iteration of the scheduler, if the blocking queue is not empty, blocking work
    // should be done. Once the blocking work has been done, perform some CPU work in the same iteration.
    }

    allQueuesEmpty() {

    }

    addNewProcess(process) {
        //adds new process to the scheduler
        //will create instance of the project and insert it into the highest priority thing?
    }


    handleInterrupt(queue, process, interrupt) {
    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
        //this also handles interrupts from finished blocking processes to be moved back into the CPU queue
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
