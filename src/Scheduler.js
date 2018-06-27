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
        while(!this.allQueuesEmpty()) {
            const slice = Date.now() - this.clock;
            //Time parameter that is passed into doBlockingwork and cpuwork
            this.clock = Date.now();
            //New this.clock time for the next usage
            if(!this.blockingQueue.isEmpty()) {
                //If the blocking queue is not empty do blocking work
                this.blockingQueue.doBlockingWork(slice);
            }
            for(let i = 0; i < this.runningQueues.length; i++) {
                if(!this.runningQueues[i].isEmpty()) {
                    //if running queue at any value on its array isnt empty do cpuwork
                    this.runningQueues[i].doCPUWork(slice);
                };
            }
        }
    }

    allQueuesEmpty() {
        //Basically checking if the queues have lengths to see if they are or are not empty
        if(this.blockingQueue.length > 0) return false;
        for(let i = 0; i < this.runningQueues.length; i++) {
            if(this.runningQueues[i].processes.length > 0) return false;
        }
        // if(this.runningQueues.processes.length > 0) return false;
        return true;
    }

    addNewProcess(process) {
        this.runningQueues[0].enqueue(process);
        //adds a new process at the first point of the array.
    }

    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
    handleInterrupt(queue, process, interrupt) {
        switch(interrupt) {
            case 'PROCESS_BLOCKED': 
            this.blockingQueue.enqueue(process);
            //sets process blocked and puts the process into the blocking queue
            break;
            case 'PROCESS_READY':
            this.addNewProcess(process);
            //sets process ready and adds it to the running queue
            break;
            case 'LOWER_PRIORITY': 
            if(queue.getQueueType() === 'BLOCKING_QUEUE') {
                queue.enqueue(process);
                //Checks if the queue type is blocking queue then enqueues it 
                break;
            }
            // Blocking queue comes from the constructor as does priority levels
            if(queue.getPriorityLevel() === PRIORITY_LEVELS - 1) {
                queue.enqueue(process);
                //Adds a process back to the lower priority queue if it was already there
            }
            else {
                this.runningQueues[queue.priorityLevel + 1].enqueue(process);
                //Moves a non blocking queue process to lower priority
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
