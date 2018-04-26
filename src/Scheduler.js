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

        /*
        while (true) {
            const time = Date.now();
            const timeslice = time - this.clock();
            this.clock = time;

            if (!this.blockingQueue.isEmpty()) {
                this.blockingQueue.doBlockingWork(timeslice);
            }

            for (let i = 0; i < PRIORITY_LEVELS; i++) {
                const queue = this.runningQueues[i];
                if(!queue.isEmpty()) {
                    queue.doCPUWork(timeslice);
                    break;
                }
            }

            if (this.allQueuesEmpty()) {
                console.log("No more processes! I can sleep now.");
                break();
            }
        }
        */
        while (!this.allQueuesEmpty()) {
            const workTime = Date.now() - this.clock;
            this.clock = Date.now();

            if (!this.blockingQueue.isEmpty()) {
                this.blockingQueue.doBlockingWork(workTime);
            }

            this.runningQueues.forEach(q => {
                if (!q.isEmpty()) {
                    q.doCPUWork(workTime);
                }
            });
        }
    }

    allQueuesEmpty() {
        return /*this.blockingQueue.isEmpty() &&*/ this.runningQueues.every(queue => queue.isEmpty() === true);
    }

    addNewProcess(process) {
        this.runningQueues[0].enqueue(process);
    }

    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
    handleInterrupt(queue, process, interrupt) {
        switch(interrupt) {
            case 'PROCESS_BLOCKED':
                this.blockingQueue.enqueue(process);
                break;
            case 'PROCESS_READY':
                this.addNewProcess(process);
                break;
            case 'LOWER_PRIORITY':
                if (queue.getQueueType() === QueueType.BLOCKING_QUEUE) {
                    queue.enqueue(process);
                    break;
                }
                const priority =  queue.getPriorityLevel();
                if (priority === PRIORITY_LEVELS - 1) {
                    queue.enqueue(process);
                    break;
                }
                this.runningQueues[priority+1].enqueue(process);
                break;
            default:
                break;
        }
        // if (interrupt === 'PROCESS_BLOCKED' || queue.getQueueType() === 'BLOCKING_QUEUE') {
        //     this.blockingQueue.enqueue(process);            
        // } else if (interrupt === 'PROCESS_READY') {
        //     this.addNewProcess(process);            
        // } else {
        //     let priority = queue.getPriorityLevel();
        //     priority++;

        //     if (priority > PRIORITY_LEVELS - 1) {
        //         priority = PRIORITY_LEVELS - 1;
        //     }
            
        //     this.runningQueues[priority].enqueue(process);
        // }
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
