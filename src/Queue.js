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
        process.setParentQueue(this);
        return this.processes.push(process);
    }

    // Dequeues the next process in the queue. Return the dequeue'd process
    dequeue() {
        return this.processes.shift();
    }

    // Return the least-recently added process without removing it from the list of processes
    peek() {
        return this.processes[0]
    }

    isEmpty() {

    }

    getPriorityLevel() {
        return this.priorityLevel;
    }

    getQueueType() {
        return this.queueType;
    }


    manageTimeSlice(currentProcess, time) {
    // Manages a process's execution for the given amount of time
    // Processes that have had their states changed should not be affected
    // Once a process has received the alloted time, it needs to be dequeue'd and 
    // then handled accordingly, depending on whether it has finished executing or not
        if (currentProcess.isStateChanged()) {
            //reset quantumClock counter
            this.quantumClock = 0;
            return;
        } //checks to see if state changes, if so, handled by other queue if not it will do stuff below
        //otherwise increment time in the quantum clock counter
        this.quantumClock += time;
        if (this.quantumClock >= this.quantum) {
            //check if the quantum clock counter is greater than quantum
            this.quantumClock = 0;
            //reset clock for next process
            const process = this.dequeue();
            //remove process

            //check to see if finished
            if (!process.isFinished()) {
                //inturrupt for not finished
                this.scheduler.handleInterrupt(this, process, SchedulerInterrupt.LOWER_PRIORITY);
            } else {
                console.log(`Process ${process._pid} finished!`);
            }
        }
    }


    doCPUWork(time) {
    // Execute the next non-blocking process (assuming this is a CPU queue)
    // This method should call `manageTimeSlice` as well as execute the next running process
        const process = this.peek();
        //this gives us a reference to the next process without removing from the queue
        process.executeProcess(time);
        this.manageTimeSlice(process, time);
    }


    doBlockingWork(time) {
    // Execute the next blocking process (assuming this is the blocking queue)
    // This method should call `manageTimeSlice` as well as execute the next blocking process
        const process = this.peek();
        process.executeBlockingProcess(time);
        this.manageTimeSlice(process, time);
    }


    emitInterrupt(source, interrupt) {
    // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
    // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
    // The process also needs to be removed from the queue
        //grab the index of the source process in the this.processes array
        const sourceIndex = this.processes.indexOf(source);
        //splice out the source process
        this.processes.splice(sourceIndex, 1);
        //pass on the interrupt to the scheduler
        this.scheduler.handleInterrupt(this, source, interrupt);
    }
}

module.exports = Queue;
