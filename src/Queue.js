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
    // because this is fifo push into the back of the array at the end
    this.processes.push(process);
    // test asked for us o set parent queue
    process.setParentQueue(this);
  }

  // Dequeues the next process in the queue. Return the dequeue'd process
  dequeue() {
    // shift the item at index 0 of the array,
    return this.processes.shift();
  }

  // Return the least-recently added process without removing it from the list of processes
  peek() {
    return this.processes[0];
  }

  isEmpty() {
    return this.processes.length ? false : true;
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
    // if the state has not changed
    if (!currentProcess.isStateChanged()) {
      // increment the quantum clock
      this.quantumClock += time;
      /* if the quantum clock is greater or equal to the quantum
         set the quantum clock to zero and deque
      */
      if (this.quantumClock >= this.quantum) {
        // setting clock to zero
        this.quantumClock = 0;
        // deque the process
        this.dequeue();
        // if the current process is not finished then handle the interupt
        if (!currentProcess.isFinished()) {
          // handling the interupt here passing in the queue process and interupt
          this.scheduler.handleInterrupt(
            this,

            currentProcess,

            SchedulerInterrupt.LOWER_PRIORITY
          );
        }
      }
    }
  }

  // Execute the next non-blocking process (assuming this is a CPU queue)
  // This method should call `manageTimeSlice` as well as execute the next running process
  doCPUWork(time) {
    // store the first process inside of a variable
    const currentProcess = this.peek();
    // call  manage time slice and pass in the variable for the first process
    this.manageTimeSlice(currentProcess,time)
    // execute the non blocking process
    currentProcess.executeProcess(time);
  }

  // Execute the next blocking process (assuming this is the blocking queue)
  // This method should call `manageTimeSlice` as well as execute the next blocking process
  doBlockingWork(time) {
  // store the first process inside of a variable
  const currentProcess = this.peek();
  // call  manage time slice and pass in the variable for the first process
  this.manageTimeSlice(currentProcess,time)
  // execute the blocking process
    currentProcess.executeBlockingProcess(time);
  }

  // The queue's interrupt handler for notifying when a process needs to be moved to a different queue
  // Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
  // The process also needs to be removed from the queue
  emitInterrupt(source, interrupt) {
      this.processes = this.processes.filter(process => process !== source)
      this.scheduler.handleInterrupt(this,source,interrupt)
  }
}

module.exports = Queue;
