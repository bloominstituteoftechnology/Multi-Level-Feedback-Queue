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
    // enqueue -> | 3 | 2 | 1 | -> dequeue
    enqueue(process) {
        this.processes.unshift(process);
        return process;
    }

    // Dequeues the next process in the queue. Return the dequeue'd process
    // enqueue -> | 3 | 2 | 1 | -> dequeue
    dequeue() {
        const temp = this.processes.shift();
        return temp;
    }

    // Return the least-recently added process without removing it from the list of processes
    peek() {
        return this.processes[0];
    }

    isEmpty() {
        if (this.processes.length === 0) return true;
        return false;
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
    manageTimeSlice(currentProcess, time) {
        if (currentProcess.isStateChanged()) {
            this.quantumClock = 0;
            return;
        } else {
            // Gives time for process to execute
            this.quantumClock += time; 
            // If given time is greater/equal than the allotted time slice
            if (this.quantumClock >= this.quantum) {
                this.quantumClock = 0;
                this.dequeue(); // executes the process
            }
            // If the process doesn't finish, move it down a priority level
            if (!currentProcess.isFinished()) this.scheduler.handlerInterrupt(this, currentProcess, SchedulerInterrupt.LOWER_PRIORITY)
            else console.log("Completed");
        }
    }

    // Execute the next non-blocking process (assuming this is a CPU queue)
    // This method should call `manageTimeSlice` as well as execute the next running process
    doCPUWork(time) {
        if (this.peek) this.manageTimeSlice(this.processes[0], time);
    }

    // Execute the next blocking process (assuming this is the blocking queue)
    // This method should call `manageTimeSlice` as well as execute the next blocking process
    doBlockingWork(time) {
        if (this.peek) this.manageTimeSlice(this.processes[0], time);
    }

    // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
    // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
    // The process also needs to be removed from the queue
    emitInterrupt(source, interrupt) {
        
    }
}

module.exports = Queue;
