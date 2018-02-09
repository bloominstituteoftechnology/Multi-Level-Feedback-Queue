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
        this.boostedProcesses = [];
        this.runningQueues = [];

        for (let i = 0; i < PRIORITY_LEVELS; i++) {
            this.runningQueues[i] = new Queue(this, 10 + i * 20, i, QueueType.CPU_QUEUE);
        }
    }

    // Executes the scheduler in an infinite loop as long as there are processes in any of the queues
    // Initialize a variable with the current time and subtract current time by `this.clock` to get the `workTime`
    // `workTime` will be the amount of time each queue will be given to execute their processes for
    // Update `this.clock` with the new current time
    // First, check to see if there are processes in the blocking queue
    // If there are, execute a blocking process for the amount of time given by `workTime`
    // Then, iterate through all of the running queues and execute processes on those queues for the amount of time given by `workTime`
    // Once that is done, check to see if the queues are empty
    // If yes, then break out of the infinite loop
    // Otherwise, perform another loop iteration
    run() {
        // const maxLoops = 20000;
        // let loop = 0; 
        let totalTime = 0;
        const BOOST_TIME = 500;
        while (!this.allEmpty()) {
            // if (++loop >= maxLoops) {
            //     console.log(`   blocking length: ${this.blockingQueue.processes.length}
            //      0: ${this.runningQueues[0].processes.length}     
            //      1: ${this.runningQueues[1].processes.length}    
            //      2: ${this.runningQueues[2].processes.length}    
            //       `);
            //     break;
            // }
            const now = Date.now();
            const workTime = Math.max(now - this.clock, 1); // milliseconds
            totalTime += workTime;
            if (totalTime > BOOST_TIME) {
                this.runningQueues.forEach(queue => {
                    if (queue.priorityLevel > 0)
                        queue.processes.forEach(process => {
                            // if (process.cpuTimeNeeded > 0) {
                           // console.log(`>>>>> BOOST_TIME process pid: ${process.pid} cpu needed: ${process.cpuTimeNeeded}`);
                            this.runningQueues[0].enqueue(process)
                            this.boostedProcesses.push(process);
                            //}
                        })
                })
                for (let i = 1; i < PRIORITY_LEVELS; i++) {
                    this.runningQueues[i].processes = [];
                }
            }
            //console.log(`workTime ${workTime}`);
            this.clock = now;
            this.blockingQueue.processes.forEach(process => {
                this.blockingQueue.doBlockingWork(process, workTime)
                // element.executeBlockingProcess(workTime)
            });
            // this.runningQueues.forEach(queue => {
            // queue.processes.forEach(process => {
            //     queue.doCPUWork(workTime, process)
            // })
            if (this.runningQueues[0].processes.length == 0) { // if nothing to run look at lower priority queues
                for (let i = 1; i < PRIORITY_LEVELS; i++) {
                    if (this.runningQueues[i].processes.length > 0) {
                        // console.log(`>>>> process pid promoted to 0 : ${this.runningQueues[i].peek().pid}`)
                        this.runningQueues[0].enqueue(this.runningQueues[i].dequeue());
                        break;
                    }
                }
            }
            this.runningQueues[0].doCPUWork(workTime);
            // })    
        }

    }
    _boostedQueues() {
        return this.boostedProcesses;
    }
    // Checks that all queues have no processes 
    allEmpty() {
        return (this.blockingQueue.isEmpty() && this.runningQueues.reduce((em, q) => { if (!q.isEmpty()) em = false; return em }, true));
    }

    // Adds a new process to the highest priority level running queue
    addNewProcess(process) {
        this._getCPUQueue(0).enqueue(process);
    }

    // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string
    // In the case of a PROCESS_BLOCKED interrupt, add the process to the blocking queue
    // In the case of a PROCESS_READY interrupt, add the process to highest priority running queue
    // In the case of a LOWER_PRIORITY interrupt, check to see if the input queue is a running queue or blocking queue
    // If it is a running queue, add the process to the next lower priority queue, or back into itself if it is already in the lowest priority queue
    // If it is a blocking queue, add the process back to the blocking queue
    handleInterrupt(queue, process, interrupt) {
        // console.log(`================in handleInterrupt queue: ${queue.quantum}  process: ${process.pid} interrupt: ${interrupt} `);
        switch (interrupt) {
            case SchedulerInterrupt.PROCESS_BLOCKED:
                //  console.log('Process Blocked blockingQueue enqueue');
                this.blockingQueue.enqueue(process);
                break;
            case SchedulerInterrupt.PROCESS_READY:
                process.blockingTimeNeeded = 0;
                this.addNewProcess(process);
                break;
            case SchedulerInterrupt.LOWER_PRIORITY:
                if (queue == this.blockingQueue) {
                    // console.log('blockingQueue LOWER_PRIORITY blockingQueue enqueue');
                    this.blockingQueue.enqueue(process)
                }
                else {
                    if (this.boostedProcesses.length > 0) return;
                    const priority = Math.min(queue.priorityLevel + 1, PRIORITY_LEVELS - 1);
                    // console.log(`priority: ${priority}`);
                    (this._getCPUQueue(priority)).enqueue(process);
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
