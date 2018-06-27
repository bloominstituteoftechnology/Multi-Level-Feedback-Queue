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
        //Sets parent queue aka this.queue
        this.processes.push(process);
        //Push the process into the array to enqueue
    }

    // Dequeues the next process in the queue. Return the dequeue'd process
    dequeue() {
            return this.processes.shift();
            //Removes the process from the array
    }

    // Return the least-recently added process without removing it from the list of processes
    peek() {
        return this.processes[0];
        //Looks at the first process in the array;
    }

    isEmpty() {
        return this.processes.length === 0;
        //Basically check if processes length is 0 if so true else false
    }

    getPriorityLevel() {
        return this.priorityLevel;
        //returns the priority level fairly simple
    }

    getQueueType() {
        return this.queueType;
        //returns queue type fairly simple
    }

    // Manages a process's execution for the given amount of time
    // Processes that have had their states changed should not be affected
    // Once a process has received the alloted time, it needs to be dequeue'd and 
    // then handled accordingly, depending on whether it has finished executing or not
    manageTimeSlice(currentProcess, time) {
        if(currentProcess.isStateChanged() === false) {
            this.quantumClock += time;
            //Checks if the state hasnt changed if so it increments time on the quantum clock;
        }
        //Since the first part is incrementing the time we can make the second part check if the time alloted is finished and then dequeue
        if(this.quantumClock >= this.quantum) {
            this.quantumClock = 0;
            this.dequeue();
        
        if(currentProcess.isFinished() === false) {
            //Set interrupt value to lower priority if current process is not finished
            this.scheduler.handleInterrupt(this, currentProcess, 'LOWER_PRIORITY');
        }
    }
    }

    // Execute the next non-blocking process (assuming this is a CPU queue)
    // This method should call `manageTimeSlice` as well as execute the next running process
    doCPUWork(time) {
        const process = this.peek();
        process.executeProcess(time);
        //executes the process over the amount of time then passes in time to managetimeslice
        this.manageTimeSlice(process, time);
    }

    //Had to set process to this.peek() i kept getting errors when just using this.peek()

    // Execute the next blocking process (assuming this is the blocking queue)
    // This method should call `manageTimeSlice` as well as execute the next blocking process
    doBlockingWork(time) {
        const process = this.peek();
        process.executeBlockingProcess(time);
        //executes the process over the amount of time then passes in time to managetimeslice
        this.manageTimeSlice(process, time);
    }

    // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
    // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
    // The process also needs to be removed from the queue

    //I used splice to remove the source at its index value;
    emitInterrupt(source, interrupt) {
        this.scheduler.handleInterrupt(this, source, interrupt);
        //Had to pass in this to the interrupt to point it 
        //and then add source and interrupt as parameters 
        this.processes.splice(this.processes.indexOf(source), 1);
    }
}

module.exports = Queue;
