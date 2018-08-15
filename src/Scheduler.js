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
        //while all queues aren't empty
        while(this.allQueuesEmpty() === false){
            //setup our time slice
            const timeSlice = Date.now() - this.clock;

            //if there are elements in the blockingQueue CPU will do blockingWork
            if(!this.blockingQueue.isEmpty()) this.blockingQueue.doBlockingWork(timeSlice);

            //else we go hunt through the other queues and do CPU work
            this.runningQueues.forEach(e => {
                if(!e.isEmpty()) e.doCPUWork(timeSlice);
            })            
            //once done, we reset the clock
            this.clock = Date.now()
        }
    }

    allQueuesEmpty() {
        if(!this.blockingQueue.isEmpty()) return false;
        return this.runningQueues.every(e => e.isEmpty());
    }

    addNewProcess(process) {
        this.runningQueues[0].enqueue(process);
    }

    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
    handleInterrupt(queue, process, interrupt) {
        // if process is blocked, enqueue in blocked queue
        if(interrupt === "PROCESS_BLOCKED"){
            this.blockingQueue.enqueue(process);
            return;
        // if it is ready, enequeue into highest priority queue
        }else if (interrupt === "PROCESS_READY"){
            this.addNewProcess(process);
            return;
        } else{
            // if it falls into lower priority, determine prio
            const priority = queue.getPriorityLevel();
            if(queue.getQueueType() === "BLOCKING_QUEUE"){
                queue.enqueue(process);
                return;
            }else if (priority === PRIORITY_LEVELS - 1){
                // if we are in lowest prio, to the back of the queue!
                queue.enqueue(process);
                return;
            }
            // else push it into the next lower
            this.runningQueues[priority + 1].enqueue(process);
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
