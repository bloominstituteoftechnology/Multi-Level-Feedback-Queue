const { SchedulerInterrupt, QueueType } = require('./constants/index');

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
        return this.processes[0];
    }

    isEmpty() {
        return this.processes.length === 0 ? true : false;
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
        //quantumClock = quantum ? 
        if(currentProcess.isStateChanged()) { //if currentProcess is changed from block to running, quantumClock starts over
            this.quantumClock = 0;
            return;
        }
        this.quantumClock += time;
        if(this.quantum - this.quantumClock > 0){
            return this.quantum - this.quantumClock;
        }
        this.dequeue();
        if(this.quantumClock >= this.quantum) {
            this.quantumClock = 0;
            if(!currentProcess.isFinished()){
                this.scheduler.handleInterrupt(this, currentProcess, SchedulerInterrupt.LOWER_PRIORITY);
            } 

        }  else if (this.quantum > process.cpuTimeNeeded){
            return;
        }
    }

    // Execute the next non-blocking process (assuming this is a CPU queue)
    // This method should call `manageTimeSlice` as well as execute the next running process
    doCPUWork(time) {
        if(this.queueType === QueueType.CPU_QUEUE){
            const process = this.peek();
            process.executeProcess(time);
            this.manageTimeSlice(process, time);
        }
    }

    // Execute the next blocking process (assuming this is the blocking queue)
    // This method should call `manageTimeSlice` as well as execute the next blocking process
    doBlockingWork(time) {
        if (this.queueType === QueueType.BLOCKING_QUEUE){
            const process = this.peek();
            process.executeBlockingProcess(time);
            this.manageTimeSlice(process, time);
        }

    }

    // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
    // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
    // The process also needs to be removed from the queue
    emitInterrupt(source, interrupt) {
        let index = this.processes.indexOf(source);
        // //find index of source
        this.processes.splice(index, 1); //remove source from queue

        switch(interrupt){
            case SchedulerInterrupt.PROCESS_BLOCKED:
                this.scheduler.handleInterrupt(this, source, SchedulerInterrupt.PROCESS_BLOCKED);
                break;
            case SchedulerInterrupt.PROCESS_READY:
            this.scheduler.handleInterrupt(this, source, SchedulerInterrupt.PROCESS_READY);
            default:
                break;
        }
    
    }
}
module.exports = Queue;
