const { SchedulerInterrupt } = require('./constants/index');

class Queue {
    constructor(scheduler, quantum, priorityLevel, queueType) {
        this.processes = [];
        this.priorityLevel = priorityLevel;
        this.scheduler = scheduler;
        this.quantum = quantum;
        this.quantumClock = 0;
        this.queueType = queueType;
    }

    manageTimeSlice(currentProcess, time) {
        if (currentProcess.isStateChanged()) {
            this.quantumClock = 0;
            return;
        }

        this.quantumClock += time;
        if (this.quantumClock >= this.quantum) {
            this.quantumClock = 0;
            this.dequeue();

            if (!currentProcess.isFinished()) {
                this.scheduler.handleInterrupt(this, currentProcess, SchedulerInterrupt.LOWER_PRIORITY);
            } else {
                console.log("Process complete!");
            }
        }
    }

    doCPUWork(time) {
        const process = this.peek();
        process.executeProcess(time);
        this.manageTimeSlice(process, time);
    }

    doBlockingWork(time) {
        const process = this.peek();
        process.executeBlockingProcess(time);
        this.manageTimeSlice(process, time);
    }

    isEmpty() {
        return this.processes.length === 0;
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

    enqueue(process) {
        process.setParentQueue(this);
        return this.processes.push(process);
    }

    dequeue() {
        return this.processes.shift();
    }

    peek() {
        return this.processes[0];
    }

    getPriorityLevel() {
        return this.priorityLevel;
    }

    getQueueType() {
        return this.queueType;
    }
}

module.exports = Queue;        
