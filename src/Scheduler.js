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
        if(this.allQueuesEmpty() === false) {
            this.run();
        } else {
            return;
        }
    }

    allQueuesEmpty() {
        let queuesEmpty = true;
        // MY NOTE:  if blocking queue is empty and all running queues are empty, check queues = true
        if(this.blockingQueue.length === 0) {
            for(let i = 0; i < PRIORITY_LEVELS; i++) {
                if(this.runningQueues[i].length > 0) {
                    queuesEmpty = false;
                }
            }
        } else {
            queuesEmpty = false;
        }
        return queuesEmpty;
    }

    addNewProcess(process) {
        if(process.blockingTimeNeeded > 0){
            this.scheduler.blockingQueue.push(process);
        } else {
            this.scheduler.runningQueues[0].push(process);
        }
    }

    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
    handleInterrupt(queue, process, interrupt) {
        switch(interrupt){
            case "PROCESS_BLOCKED":
                this.blockingQueue.enqueue(process);
                queue.dequeue();
                console.log(this.blockingQueue.processes[0]);
                return this.blockingQueue.processes[0];

            case "PROCESS_READY":
                this.runningQueues[0].enqueue(process);
                queue.dequeue();
                break;
            case "LOWER_PRIORITY":
                for(let i = 0; i < runningQueues.length; i++){
                    if(queue === runningQueues[i]){
                        this.runningQueues[i+1].enqueue(process);
                        queue.dequeue();
                        break;
                    }
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
