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
        if (this.processes.length === 0) {
            return true;
        }
        return false;
    }

    getPriorityLevel() {
        return this.priorityLevel;
    }

    getQueueType() {
        return this.queueType;
    }

    // Manages a process's execution for the given amount of times that have had their states changed should not be affected
    // Once a process has received the alloted time, it needs to be dequeue'd and 
    // then handled accordingly, depending on whether it has finished executing or not
    manageTimeSlice(currentProcess, time) {
        //if this.currentproces.statechanged === true{
            //dont mess with it
            //if time == this.quantum {
                //dequeue the process
                //emmit interrupt
                // if its not finished
                //we move to the next process in the queue 
                // else if its finshed
                // we remove it from the queue
            //}
        //}
        const { LOWER_PRIORITY } = SchedulerInterrupt;

        if (currentProcess.isStateChanged()) {
            // Reset the quantum clock?
            this.quantumClock = 0;
        }
        else {
           //process takes time < quantum idk what i am saying! 
           if (this.quantumClock < time) {
                this.quantumClock = time;
            }

            if (this.quantumClock > this.quantum) {
                this.quantumClock = 0;

                if (!currentProcess.isFinished()) {
                    this.scheduler.handleInterrupt(this, currentProcess, LOWER_PRIORITY);
                }
                this.dequeue();
            }

        }
        
    }

    // Execute the next non-blocking process (assuming this is a CPU queue)
    // This method should call `manageTimeSlice` as well as execute the next running process
    doCPUWork(time) {
        let proc = this.peek()
        proc.executeProcess(time);
        this.manageTimeSlice(proc,time);
    }

    // Execute the next blocking process (assuming this is the blocking queue)
    // This method should call `manageTimeSlice` as well as execute the next blocking process
    doBlockingWork(time) {
        let proc = this.peek()
        proc.executeBlockingProcess(time);
        this.manageTimeSlice(proc,time);
    }

    // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
    // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
    // The process also needs to be removed from the queue
    emitInterrupt(source, interrupt) {
        if (interrupt === SchedulerInterrupt.PROCESS_BLOCKED){
            let index = this.processes.indexOf(source);
            if (index > -1) {
                this.processes.splice(index, 1);
                this.scheduler.handleInterrupt(this, source, interrupt);
            }
        }
        else if(interrupt === SchedulerInterrupt.PROCESS_READY){
            this.enqueue(source);
            this.scheduler.handleInterrupt(this, source, interrupt);
        }
        else{

        }
        
    }
}

module.exports = Queue;
