const Queue = require('./Queue'); 
const { 
	QueueType,
   PRIORITY_LEVELS,
   SchedulerInterrupt
} = require('./constants/index');

// A class representing the scheduler
// It holds a single blocking queue for blocking processes and three running queues 
// for non-blocking processes
class Scheduler { 
	constructor() { 
		this.clock = Date.now();
		this.blockingQueue = new Queue(this, 50, 0, QueueType.BLOCKING_QUEUE);
		this.runningQueues = [];
		// Initialize all the CPU running queues
		for (let i = 0; i < PRIORITY_LEVELS; i++) {
			this.runningQueues[i] = new Queue(this, 10 + i * 20, i, QueueType.CPU_QUEUE);
		}
	}

	// Executes the scheduler in an infinite loop as long as there are processes in any of the queues
	// Calculate the time slice for the next iteration of the scheduler by subtracting the current
	// time from the clock property. Don't forget to update the clock property afterwards.
	// On every iteration of the scheduler, if the blocking queue is not empty, blocking work
	// should be done. Once the blocking work has been done, perform some CPU work in the same iteration.
	run() {

      while (!this.allQueuesEmpty()) {
         const slice = Date.now() - this.clock;
         this.clock = Date.now();

         if (!this.blockingQueue.isEmpty()) this.blockingQueue.doBlockingWork(slice);

         this.runningQueues.forEach(runner => !runner.isEmpty() ? runner.doCPUWork(slice) : null);
      }

	}

	allQueuesEmpty() {
      return this.blockingQueue.isEmpty() && 
         this.runningQueues[0].isEmpty() && 
         this.runningQueues[1].isEmpty() && 
         this.runningQueues[2].isEmpty();
	}

	addNewProcess(process) {
      this.runningQueues[0].enqueue(process);
	}

	// The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
	// Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
	handleInterrupt(queue, process, interrupt) {
      switch(interrupt) {
         // move process to top priority queue
         case SchedulerInterrupt.PROCESS_READY:
            this.addNewProcess(process);
            break;
         
         // move process to blocking queue
         case SchedulerInterrupt.PROCESS_BLOCKED:
            this.blockingQueue.enqueue(process);
            break;

         // if its a blocking process, move to end of blocking queue
         // else move it down one priority. if already at last priority, move to end of the line
         case SchedulerInterrupt.LOWER_PRIORITY:
            // if (queue.getQueueType() === QueueType.BLOCKING_QUEUE) this.blockingQueue.enqueue(process);
            // else if (queue.getPriorityLevel() === 2) this.runningQueues[2].enqueue(process);
            if (queue.getQueueType() === QueueType.BLOCKING_QUEUE || queue.getPriorityLevel() === 2) queue.enqueue(process);
            else this.runningQueues[queue.getPriorityLevel() + 1].enqueue(process);
            break;

         default:
            break;
      }
	}

	// Private function used for testing; DO NOT MODIFY
	_getCPUQueue(priorityLevel) {
		return this.runningQueues[priorityLevel];
	}

	// Private function used for testing; DO NOT MODIFY
	_getBlockingQueue() {
		return this.blockingQueue;
	}
}

module.exports = Scheduler;
