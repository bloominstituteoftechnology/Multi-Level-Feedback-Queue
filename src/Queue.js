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
	// adds an item of data awaiting processing to a queue of items
	enqueue(process) {
		process.setParentQueue(this);
		return this.processes.push(process);
	}

	// Dequeues the next process in the queue. Return the dequeue'd process
	// removes an item of data awaiting processsing to a a que of items.
	dequeue() {
		return this.processes.shift();
	}

	// Return the least-recently added process without removing it from the list of processes
	peek() {
		return this.processes[0];
	}

	isEmpty() {
		if (this.processes.length <= 0) {
			return true;
		} else {
			return false;
		}
		//return this.processes.length;
	}

	getPriorityLevel() {
		return this.priorityLevel;
	}

	getQueueType() {
		// if(SchedulerInterrupt.PROCESS_BLOCKED === true) {
		//    return this.queueType = 'BLOCKING_QUEUE';
		// } else if(SchedulerInterrupt.PROCESS_READY === true) {
		//    return this.queueType = 'CPU_QUEUE';
		// } else {
		//     return this.queueType = 'CPU_QUEUE';
		// }
		return this.queueType;
	}

	// Manages a process's execution for the given amount of time
	// Processes that have had their states changed should not be affected
	// Once a process has received the alloted time, it needs to be dequeue'd and
	// then handled accordingly, depending on whether it has finished executing or not
	manageTimeSlice(currentProcess, time) {}

	// Execute the next non-blocking process (assuming this is a CPU queue)
	// This method should call `manageTimeSlice` as well as execute the next running process
	doCPUWork(time) {}

	// Execute the next blocking process (assuming this is the blocking queue)
	// This method should call `manageTimeSlice` as well as execute the next blocking process
	doBlockingWork(time) {}

	// The queue's interrupt handler for notifying when a process needs to be moved to a different queue
	// Should handle PROCESS_BLOCKED and PROCESS_READY interrupts
	// The process also needs to be removed from the queue
	emitInterrupt(source, interrupt) {
		//if(interrupt === 'PROCESS_BLOCKED') {
		// MOVE TO THE BLOCKED QUEUE
		// this.process[0];
		//} else if(interrupt === 'PROCESS_READY') {
		// move to the non blocking queue
	}
}

module.exports = Queue;
