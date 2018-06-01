const { SchedulerInterrupt } = require('./constants/index');

// A class representation of a process queue that may hold either a 
// blocking or non-blocking process
class Queue {
    constructor(scheduler, quantum, priorityLevel, queueType) {
        this.processes = [];
        // The queue's priority level; the lower the number, the higher the priority
        this.priorityLevel = priorityLevel; // assigned by scheduler 
        // The queue's parent scheduler
        this.scheduler = scheduler;
        // The queue's allotted time slice; each process in this queue is executed for this amount of time in total
        // This may be done over multiple scheduler iterations
        this.quantum = quantum; // timeslice asosiated with each queue, highest priority has lowest quantum
        // A counter to keep track of how much time the queue has been executing so far
        this.quantumClock = 0; // counter, when cpu starts executing process, increment until quantum threshold is reached
        this.queueType = queueType; // blocking or running
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

    // Manages a process's execution for the given amount of time
    // Processes that have had their states changed should not be affected
    // Once a process has received the alloted time, it needs to be dequeue'd and 
    // then handled accordingly, depending on whether it has finished executing or not
    manageTimeSlice(currentProcess, time) {

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
        // remove process from que
        this.processes = this.processes.filter(process => process !== source);

        if (interrupt === 'PROCESS_BLOCKED') {
            this.scheduler.handleInterrupt(this, source, SchedulerInterrupt.PROCESS_BLOCKED);
        }
        if (interrupt === 'PROCESS_READY') {
            this.scheduler.handleInterrupt(this, source, SchedulerInterrupt.PROCESS_READY);
        }
    }
}

module.exports = Queue;
