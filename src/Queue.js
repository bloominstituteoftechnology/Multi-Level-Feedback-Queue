const { SchedulerInterrupt } = require('./constants/index');

// A class representation of a process queue that may hold either
// blocking or non-blocking processes
class Queue {
    constructor(scheduler, quantum, priorityLevel, queueType) {
        this.processes = [];
        // The queue's priority level; the lower the number, the higher the priority
        this.priorityLevel = priorityLevel;
        // The queue's parent scheduler
        this.scheduler = scheduler;
        // The queue's allotted time slice; each process in this queue is executed for this amount of time
        this.quantum = quantum;
        // A counter to keep track of how much time the queue has been executing so far
        this.quantumClock = 0;
        this.queueType = queueType;
    }

    enqueue(process) {
        process.setParentQueue(this);
        return this.processes.push(process);
     }

    dequeue() {
        return this.processes.shift();
    }

    peek() {
        return this.processes[0]; /* Need to account how we implemented enqueue() and dequeue() */
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

    manageTimeSlice(currentProcess, time) {
        if (currentProcess.isStateChanged()) {
            this.quantumClock = 0; // changed blocking ready or ready for blocking which is why we set it to 0
            return;
        }
        this.quantumClock += time;
        if (this.quantumClock >= this.quantum) {
            this.quantumClock = 0;
            const process = this.dequeue();

            if (!process.isFinished()) {
                this.scheduler.handleInterrupt(this, process, SchedulerInterrupt.LOWER_PRIORITY);
            } else {
                console.log("Process Complete!");
            }
        }
    }

    doCPUWork(time) {
        const process = this.peek(); // we get a reference to the next process in line but do not change the processes array
        process.executeProcess(time);
        this.manageTimeSlice(process, time);
    }

    doBlockingWork(time) {
        const process = this.peek();
        process.executeBlockingProcess(time);
        this.manageTimeSlice(process, time);
    }

    emitInterrupt(source, interrupt) {
        const sourceIndex = this.processes.indexOf(source);
        this.processes.splice(sourceIndex, 1);

        switch(interrupt) {
            case 'PROCESS_BLOCKED':
                this.scheduler.handleInterrupt(this, source, SchedulerInterrupt.PROCESS_BLOCKED);
                break;
            case 'PROCESS_READY':
                this.scheduler.handleInterrupt(this, source, SchedulerInterrupt.PROCESS_READY);
                break;
            default:
                break;
        }
    }
}

module.exports = Queue;