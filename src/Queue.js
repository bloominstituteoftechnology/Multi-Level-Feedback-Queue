const { SchedulerInterrupt } = require('./constants/index');

// A class representation of a process queue that may hold either a 
// blocking or non-blocking process
class Queue {
    constructor(scheduler, quantum, priorityLevel, queueType) {
        this.processes = [];
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

    }

    // Dequeues the next process in the queue. Return the dequeue'd process
    dequeue() {

    }

    // Return the least-recently added process without removing it from the list of processes
    peek() {

    }

    isEmpty() {

    }

    getPriorityLevel() {

    }

    getQueueType() {

    }

    // Manages a process's execution for the appropriate amount of time
    // Checks to see if currentProcess's `this.stateChanged` property is true
    // If it is, reset `this.quantumClock` to give the process more time and return
    // Otherwise, increment `this.quantumClock` by `time`
    // Check to see if `this.quantumClock` is greater than `this.quantum`
    // If it is, remove the current process from its queue to make way for the next process in line
    // Set `this.quantumClock` to 0
    // Dequeue the next process from the queue
    // If it isn't finished, emit a scheduler interrupt notifying the scheduler that this process
    // needs to be moved to a lower priority queue
    manageTimeSlice(currentProcess, time) {

    }

    // Execute a non-blocking process
    // Peeks the next process and runs its `executeProcess` method with input `time`
    // Call `this.manageTimeSlice` with the peeked process and input `time`
    doCPUWork(time) {

    }

    // Execute a blocking process
    // Peeks the next process and runs its `executeBlockingProcess` method with input `time`
    // Call `this.manageTimeSlice` with the peeked process and input `time`
    doBlockingWork(time) {

    }

    // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
    // Receives a source process and an interrupt string
    // Find the index of the source process in `this.processes` and splice the process out of the array
    // In the case of a PROCESS_BLOCKED interrupt, emit the appropriate scheduler interrupt to the scheduler's interrupt handler
    // In the case of a PROCESS_READY interrupt, emit the appropriate scheduler interrupt to the scheduler's interrupt handler
    emitInterrupt(source, interrupt) {

    }
}

module.exports = Queue;
