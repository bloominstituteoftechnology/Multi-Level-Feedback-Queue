const { SchedulerInterrupt } = require('./constants/index');

// A class representation of a process queue that may hold either a 
// blocking or non-blocking process
class Queue {
    constructor(scheduler, quantum, priorityLevel, queueType) {
        this.processes = [];    // an array for all processes  
        // The queue's priority level; the lower the number, the higher the priority
        this.priorityLevel = priorityLevel; // keeps track of the processes' priority levels
        // The queue's parent scheduler
        this.scheduler = scheduler; // communicate directly with scheduler via interrrupts
        // The queue's allotted time slice; each process in this queue is executed for this amount of time in total
        // This may be done over multiple scheduler iterations
        this.quantum = quantum; // mirrors the function cpuTimeNeeded; a process is done when quantum clock hits this quantum
        // A counter to keep track of how much time the queue has been executing so far
        this.quantumClock = 0;  
        this.queueType = queueType;
    }

    // Enqueues the given process. Return the enqueue'd process
    enqueue(process) {  // puts the item into the queue
        process.setParentQueue(this);   // set the parent queue to 'this' queue
        this.processes.push(process);   // use array push    
        return process;                 // return the result of the push 
    }

    // Dequeues the next process in the queue. Return the dequeue'd process
    dequeue() { // removes the item from the queue FIFO
        return this.processes.shift();  // use array shift
    }

    // Return the least-recently added process without removing it from the list of processes
    peek() {    // gives the process a reference number; only dequeues the process once it's done or have to be moved to the next priority queue    
        return this.processes[0];   // 0 index references/points to the process that was recently added 
    }

    isEmpty() {        
        return this.processes.length === 0;   // to check if queue is empty
    }

    getPriorityLevel() {
        return this.priorityLevel;
    }

    getQueueType() {
        return this.queueType; 
    }

    // Manages a process's execution for the given amount of time
    // Processes that have had their states changed should not be affected
    // Once a process has received the alloted time, it needs to be dequeue'd and 
    // then handled accordingly, depending on whether it has finished executing or not
    manageTimeSlice(currentProcess, time) { // manages and keeps track of how much time has elapsed; similar to the function executeProcess in Process.js
        if (currentProcess.isStateChanged()) { // check if process is in the blocking queue or not
            this.quantumClock = 0;  
            return;
        }

        this.quantumClock += time;
        if (this.quantumClock >= this.quantum) {   // check if process has used up its alloted time
            this.quantumClock = 0;   // reset the quantum clock to 0 for the next process
            const process = this.dequeue(); // dequeue

            if (!process.isFinished ()) {   // if process is not finished
                this.scheduler.handleInterrupt(this, process, SchedulerInterrupt.LOWER_PRIORITY);   // call the interrupt function and move process to lower priority queue
            }
        }
    }

    // Execute the next non-blocking process (assuming this is a CPU queue)
    // This method should call `manageTimeSlice` as well as execute the next running process
    doCPUWork(time) {
        const process = this.peek(); // peek process
        process.executeProcess(time);   // call execute process passing in input time/ time slice
        this.manageTimeSlice(process, time);    // call manage time slice to call the bookkeeping of the time
    }

    // Execute the next blocking process (assuming this is the blocking queue)
    // This method should call `manageTimeSlice` as well as execute the next blocking process
    doBlockingWork(time) {
        const process = this.peek();
        process.executeBlockingProcess(time);
        this.manageTimeSlice(process, time);
    }

    // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
    // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
    // The process also needs to be removed from the queue
    emitInterrupt(source, interrupt) {  // takes the interrupt and the source process and pass them along to the scheduler
        const sourceIndex = this.processes.indexOf(source); // get the index of the process of the queue
        this.processes.splice(sourceIndex, 1);  // array splice; remove from the queue it's in 
        this.scheduler.handleInterrupt(this, source, interrupt); 
    }
}

module.exports = Queue;
