const { SchedulerInterrupt } = require("./constants/index");

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
        process.setParentQueue(this);
        this.processes.push(process);
        return process;
    }

    // Dequeues the next process in the queue. Return the dequeue'd process

    dequeue() {
        return this.processes.shift();
    }

    // Return the least-recently added process without removing it from the list of processes

    peek() {
        return this.processes[0];
    }

    isEmpty() {
        return this.processes.length === 0;
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
        // console.log("===", currentProcess);

        // check to see if state flag is false
        if (!currentProcess.isStateChanged()) {
            // if so increment qc by time
            this.quantumClock += time;
            if (this.quantumClock >= this.quantum) {
                this.dequeue();
                this.quantumClock = 0;

                // if so make them low priority
                if (!currentProcess.isFinished()) {
                    this.scheduler.handleInterrupt(this, currentProcess, SchedulerInterrupt.LOWER_PRIORITY);
                }
            }
        }

        return;

        // QC -> Q
        // 49 -> 50
        // 51 -> 50
        // 60 -> 50
        // console.log("time needed", this.quantumClock, "time given", this.quantum);
    }

    // Execute the next non-blocking process (assuming this is a CPU queue)
    // This method should call `manageTimeSlice` as well as execute the next running process

    doCPUWork(time) {
        // grab the processes and set to var
        const process = this.peek();
        // console.log("===", process);
        process.executeProcess(time);
        this.manageTimeSlice(process, time);
    }

    // Execute the next blocking process (assuming this is the blocking queue)
    // This method should call `manageTimeSlice` as well as execute the next blocking process

    doBlockingWork(time) {
        const process = this.peek();
        // console.log("===", process);
        process.executeBlockingProcess(time);
        this.manageTimeSlice(process, time);
    }

    // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
    // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
    // The process also needs to be removed from the queue

    emitInterrupt(source, interrupt) {
        // console.log(source);
        // console.log(interrupt);
        // console.log("===", this.processes.indexOf(source));

        // find the index of the source
        const index = this.processes.indexOf(source);
        // use splice to remove the index from the processes array
        this.processes.splice(index, 1);
        this.scheduler.handleInterrupt(this, source, interrupt);
    }
}

module.exports = Queue;
