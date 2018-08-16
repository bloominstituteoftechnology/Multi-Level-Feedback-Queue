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
        while (this.allQueuesEmpty() === false) {
            const time = Date.now()
            const forTimeSlice = time - this.clock;
            if (this.blockingQueue.isEmpty() === false) {
                this.blockingQueue.doBlockingWork(forTimeSlice);
            } else {
                this.runningQueues.forEach(cpuQ =>{
                    if (!cpuQ.isEmpty()) {
                        cpuQ.doCPUWork(forTimeSlice);
                    }
                })
            }
            this.clock = time;
        }
        // while (this.blockingQueue) {
        //     this.blockingQueue.doBlockingWork(this.clock - Date.now());
        //     this.clock = Date.now();
        // }
        // while (this.runningQueues) {
        //     for (let i = 0; i < PRIORITY_LEVELS; i++) {
        //         this.runningQueues[i].doCPUWork(this.clock - Date.now());
        //         this.clock = Date.now();
        //     }
        // }
    }

    allQueuesEmpty() {
        let empty = true;
        for (let i = 0; i < PRIORITY_LEVELS; i++) {
            if (this.runningQueues[i].isEmpty() === false) {
                empty = false;
            }
        }
        if (this.blockingQueue.isEmpty() === false) {
            empty = false;
        }
        return empty;
    }

    addNewProcess(process) {
        this.runningQueues[0].enqueue(process);
    }

    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
    handleInterrupt(queue, process, interrupt) {
        switch(interrupt) {
            case "PROCESS_BLOCKED":
                this.blockingQueue.enqueue(process);
                break;
            case "PROCESS_READY":
                this.addNewProcess(process);
                break;
            case "LOWER_PRIORITY":
                const currentQueue = this.runningQueues.indexOf(queue);
                queue.dequeue(process);
                if (this.runningQueues[currentQueue + 1] && queue.getQueueType() === 'CPU_QUEUE') {
                    this.runningQueues[currentQueue + 1].enqueue(process);
                } else {
                    queue.dequeue(process);
                    queue.enqueue(process);
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
