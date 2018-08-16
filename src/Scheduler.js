const Queue = require('./Queue'); 
const { 
    QueueType,
    PRIORITY_LEVELS,
    SchedulerInterrupt
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
        while(true){
            const current_t = Date.now();
            const sched_t = current_t - this.clock;
            this.clock = current_t;


            if(!this.blockingQueue.isEmpty()){
                this.blockingQueue.doBlockingWork(sched_t);
            }
                this.runningQueues.forEach(queue => {
                    if(!queue.isEmpty()){
                        queue.doCPUWork(sched_t);
                    }
                })
            
            if(this.allQueuesEmpty()){
                console.log("Good going - we are idle!")
                break;
            }

        }
    }

    allQueuesEmpty() { //this works
        //every queue length === 0
        
        for(let i = 0; i < this.runningQueues.length; i++){
            if(!this.runningQueues[i].isEmpty()){
                return false
                }
            }
            return this.blockingQueue.isEmpty();
        
    }

    addNewProcess(process) {
        //enqueue
        this.runningQueues[0].enqueue(process);

        
    }

    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
    handleInterrupt(queue, process, interrupt) {
        //switch statement!
        switch(interrupt){
            case SchedulerInterrupt.PROCESS_BLOCKED:
                this.blockingQueue.enqueue(process);
                break;
            case SchedulerInterrupt.PROCESS_READY:
                this.addNewProcess(process);
                break;
            case SchedulerInterrupt.LOWER_PRIORITY:
                if(queue.queueType=== QueueType.CPU_QUEUE){
                    let priorityLevel = Math.min(PRIORITY_LEVELS - 1, queue.getPriorityLevel() + 1);
                    this.runningQueues[priorityLevel].enqueue(process);
                        
                    
                } else{
                    return this.blockingQueue.enqueue(process);
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
