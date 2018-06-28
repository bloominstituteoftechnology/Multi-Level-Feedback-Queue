const { SchedulerInterrupt } = require('./constants/index');

// A class representation of a process queue that may hold either a 
// blocking or non-blocking process
class Queue {
    constructor(scheduler, quantum, priorityLevel, queueType) {
        //queue = new Queue(scheduler, 50, 0, QueueType.CPU_QUEUE);
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
        // console.log("This is the processes array", this.processes[0]);
        this.processes.unshift(process);
        // console.log("This is the processes array AFTER", this.processes[0]);
        console.log('enque', this.processes[0]);
        return this.processes[0];
    }

    // Dequeues the next process in the queue. Return the dequeue'd process
    dequeue() {
       return this.processes.shift();
        // console.log('dequeu',this.processes[0]);
    }

    // Return the least-recently added process without removing it from the list of processes
    peek() {
        // console.log("This is the peek", this.processes[0]);
        if (this.processes[0] !== undefined) {

            return this.processes[0];
        };

        return this.processes[0];
    }

    isEmpty() {
        if (this.processes.length === 0) {
            return true;
        } else {
            return false;
        }
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
        // console.log("This is the quantum", this.quantum);
        // console.log("This is the priorityLevel", this.priorityLevel);
        // console.log("Current process and time", currentProcess, time);
        if (currentProcess.stateChanged === true) {
            // console.log("What is the queu of this TRUE,",currentProcess);
            // console.log("state is true, don't affect this process");
            return currentProcess;
        }
        if (currentProcess.stateChanged === false) {
            console.log("What is the cpuTimeNeeded of this,", currentProcess.cpuTimeNeeded);
            console.log("This is the passed in time", time);
            let timeAfterQuantime = this.doCPUWork(time);
            if (timeAfterQuantime === 0 || timeAfterQuantime < 0) {
                console.log("Returned after cpuWork, time", timeAfterQuantime);
                // this.dequeue();
            };
            if (timeAfterQuantime !== 0 || timeAfterQuantime > 0) {
                console.log("Returned after cpuWork, not complete, time", timeAfterQuantime);
                // this.dequeue();
                this.doBlockingWork(timeAfterQuantime);
            };
            // currentProcess.cpuTimeNeeded -= time;
        }


    }

    // Execute the next non-blocking process (assuming this is a CPU queue)
    // This method should call `manageTimeSlice` as well as execute the next running process
    doCPUWork(time) {
        time -= this.quantum;
        this.dequeue();
        let retQueue = this.getQueueType();
        // console.log("Queue type:", retQueue);
        // if (this.queueType === QueueType.CPU_QUEUE) {

        // };
        
        // if (currentProcess.cpuTimeNeeded !== 0 || currentProcess.cpuTimeNeeded > 0) {
        //     this.doBlockingWork(time);
        // }
        return time;
    }

    // Execute the next blocking process (assuming this is the blocking queue)
    // This method should call `manageTimeSlice` as well as execute the next blocking process
    doBlockingWork(time) {
        if (this.queueType === QueueType.BLOCKING_QUEUE) {

        };
        this.manageTimeSlice(currentProcess, time);
        // console.log("Print doBlockingwork type and process", this.queueType, currentProcess);
    }

    // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
    // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
    // The process also needs to be removed from the queue
    emitInterrupt(source, interrupt) {
        // console.log("Emit interrupts, source, interrupt", source, interrupt);
    }
}

module.exports = Queue;
