const { SchedulerInterrupt } = require('./constants/index');

// A class representation of a process queue that may hold either a 
// blocking or non-blocking process
class Queue {
    constructor(scheduler, quantum, priorityLevel, queueType) {
        this.processes = []; //this is the storage for the queue
        // The queue's priority level; the lower the number, the higher the priority
        this.priorityLevel = priorityLevel;
        // The queue's parent scheduler
        this.scheduler = scheduler;
        // The queue's allotted time slice; each process in this queue is executed for this amount of time in total
        // This may be done over multiple scheduler iterations
        this.quantum = quantum;
        // A counter to keep track of how much time the queue has been executing so far
        this.quantumClock = 0;
        this.queueType = queueType;
    }

    // Enqueues the given process. Return the enqueue'd process
    enqueue(process) {
        process.setParentQueue(this); // set parent queue to this
        this.process.push(process); // push to array
        return process
    }

    // Dequeues the next process in the queue. Return the dequeue'd process
    dequeue() {
        return this.process.shift(); //use array to shift to remove from front of queue
    }

    // Return the least-recently added process without removing it from the list of processes
    peek() {
        return this.process[0]; // looks at the front of the queue. Thsi will be the least recently push element
    }

    isEmpty() {
        return this.process.length === 0; // checks to see if length is longer than 0. If it is, itn't empty
    }

    getPriorityLevel() {
        return this.priorityLevel; // returns priorityLevel property of the object
    }

    getQueueType() {
        return this.queueType; // returns queueType property of object
    }

    // Manages a process's execution for the given amount of time
    // Processes that have had their states changed should not be affected
    // Once a process has received the alloted time, it needs to be dequeue'd and 
    // then handled accordingly, depending on whether it has finished executing or not
    manageTimeSlice(currentProcess, time) { 
            if (currentProcess.isStateChanged()) {
                this.quantumClock = 0;
                return;
            }

    // Execute the next non-blocking process (assuming this is a CPU queue)
    // This method should call `manageTimeSlice` as well as execute the next running process
    doCPUWork(time) {

    }

    // Execute the next blocking process (assuming this is the blocking queue)
    // This method should call `manageTimeSlice` as well as execute the next blocking process
    doBlockingWork(time) {

    }

    // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
    // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
    // The process also needs to be removed from the queue
    emitInterrupt(source, interrupt) {

    }
}

module.exports = Queue;
