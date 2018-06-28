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
        //This is just logging the time when the scheduler is initialized
        this.blockingQueue = new Queue(this, 50, 0, QueueType.BLOCKING_QUEUE);
        this.runningQueues = [];
        // Initialize all the CPU running queues
        for (let i = 0; i < PRIORITY_LEVELS; i++) {
            this.runningQueues[i] = new Queue(this, 10 + i * 20, i, QueueType.CPU_QUEUE);
        }
    }

    //run --> basically every loop iteration, take current time and the last time the loop ran,
    //and that's the total time that's elapsed in real time. As this happens that's how much time you
    //know to pass into the scheduler so that it knows to give this much time to the process.. ?
    run() {
    // Executes the scheduler in an infinite loop as long as there are processes in any of the queues
        while (true) {
            //log the current time
            const time  Date.now();
            //take the difference between the current time and the
            //time logged by the last loop iteration
            const workTime = time - this.clock;
            // updated this.clock
            this.clock = time;

            // check the block queue to see if there are any processes there
            if (!this.blockingQueue.isEmpty()) {
                //if not empty will do blocking work
                this.blockingQueue.doBlockingWork(workTime);
            }

            //do some work on the cpu queues
            //use loop to start and break on finding a process
            for (let i = 0; i < PRIORITY_LEVELS; i++) {
                const queue = this.runningQueues[i];
                if (!queue.isEmpty()) {
                    queue.doCPUTWORK(workTime);
                    break;
                }
             }

             //check if all the queues are empty
            if (this.allQueuesEmpty()) {
                console.log("Idle mode");
                break;
            }

        }

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
        return this.runningQueues.every((queue) => queue.isEmpty()) && this.blockingQueue.isEmpty();
    }

    addNewProcess(process) {
        //adds new process to the scheduler
        //will create instance of the project and insert it into the highest priority thing?
        this.runningQueues[0].enqueue(process);
    }


    handleInterrupt(queue, process, interrupt) {
    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
    // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
        //this also handles interrupts from finished blocking processes to be moved back into the CPU queue
        switch(interrupt) {
            case SchedulerInterrupt.PROCESS_BLOCKED;
                this.blockingQueue.enqueue(process);
                break;
            case SchedulerInterrupt.PROCESS_READY;
                this.addNewProcess(process);
                break;
            case SchedulerInterrupt.LOWER_PRIORITY;
                if (queue.getQueueType() === QueueType.CPU_QUEUE) {
                    //move to the next priority queue
                    //figure out the priority level of the next queue
                    const priorityLevel = Math.min(PRIORITY_LEVELS -1, queue.getPriorityLevel() + 1);
                    //The only time priority level -1 kicks in if it's at queue 2. Because priority level -1 === 2, and queuePriority + 1 === 3. Because of min, it will chose 2 and always stay there.
                    this.runningQueues[priorityLevel].enqueue(process);
                    //above is in case in which the process is at the lowest level queue
                } else {
                    this.blockingQueue.enqueue(process);
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
