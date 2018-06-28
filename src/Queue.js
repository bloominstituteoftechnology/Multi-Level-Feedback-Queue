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
        this.processes.push(process); // this adds the process to the beginning of the processes array. 
        process.setParentQueue(this); // sets its parent queue property.
        return process; // returns that process.
    }

    // Dequeues the next process in the queue. Return the dequeue'd process
    dequeue() {
        return this.processes.shift(); // this removes a process from the end of the list, and then returns it. 
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
        if (currentProcess.isStateChanged()) { // if the currnet process has a true state changed...
          this.quantumClock = 0; // quantum clock is set to 0 giving it no time to process.
          return; // return out. 
        } // else if the stateChanged is false, meaning it has not changed states...
          this.quantumClock += time; // we add the passed in time to the quantum clock... giving it that much time to execute. 
          if (this.quantumClock > this.quantum) { // if the quantum clock is greater than or equal to the quantum...
            let deq = this.dequeue(); // dequeues the urrent process off of the queue
            this.quantumClock = 0; // quantum clock is then set to 0. 

    
            if (!currentProcess.isFinished()) { // is the current process is false for isFinished()
              this.scheduler.handleInterrupt(this, currentProcess, SchedulerInterrupt.LOWER_PRIORITY); // drop it to a lower priority.
            }
        }
      }

    // Execute the next non-blocking process (assuming this is a CPU queue)
    // This method should call `manageTimeSlice` as well as execute the next running process
    doCPUWork(time) {
        const process = this.peek(); // process is set to processes[0]...
        process.executeProcess(time); // run the execute process function on the index[0].
        this.manageTimeSlice(process, time);
    }

    // Execute the next blocking process (assuming this is the blocking queue)
    // This method should call `manageTimeSlice` as well as execute the next blocking process
    doBlockingWork(time) {
        const process = this.peek();
        process.executeBlockingProcess(time);
        this.manageTimeSlice(process, time);
    }

    // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
    // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
    // The process also needs to be removed from the queue
    emitInterrupt(source, interrupt) {
        let index = this.processes.indexOf(source);
        this.processes.splice(index, 1);
    
        this.scheduler.handleInterrupt(this, source, interrupt);
      }
}
// completed
module.exports = Queue;
