// import { worker } from 'cluster';

const Queue = require('./Queue'); 
const { 
    QueueType,
    PRIORITY_LEVELS,
} = require('./constants/index');

class Scheduler { 
    constructor() { 
        this.clock = Date.now();
        this.blockingQueue = new Queue(this, 50, 0, QueueType.BLOCKING_QUEUE);
        this.runningQueues = [];

        for (let i = 0; i < PRIORITY_LEVELS; i++) {
            this.runningQueues[i] = new Queue(this, 10 + i * 20, i, QueueType.CPU_QUEUE);
        }
    }

    run() {
        while (true) {
            const time = Date.now();
            const workTime = time - this.clock;
            this.clock = time;

            if (!this.blockingQueue.isEmpty()) {
                this.blockingQueue.doBlockingWork(workTime);
            }

            for (let i = 0; i < PRIORITY_LEVELS; i++) {
                const queue = this.runningQueues[i];
                if (!queue.isEmpty()) {
                    queue.doCPUWork(workTime);
                    break;
                }
            }

            if (this.allEmpty()) {
                console.log("Idle mode");
                break;
            }
        }
    }

    allEmpty() {
        for (let i = 0; i < this.runningQueues.length; i++) {
            if (!this.runningQueues[i].isEmpty()) {
                return false;
            }
        }

        return this.blockingQueue.isEmpty();
    }

    addNewProcess(process) {
        this.runningQueues[0].enqueue(process);
    }

    handleInterrupt(queue, process, interrupt) {
        switch(interrupt) {
            case 'PROCESS_BLOCKED':
                this.blockingQueue.enqueue(process);
                break;
            case 'PROCESS_READY':
                this.addNewProcess(process);
                break;
            case 'LOWER_PRIORITY':
                if (queue.getQueueType() === QueueType.CPU_QUEUE) {
                    const priorityLevel = Math.min(PRIORITY_LEVELS - 1, queue.getPriorityLevel() + 1);
                    this.runningQueues[priorityLevel].enqueue(process);
                } else {
                    this.blockingQueue.enqueue(process);
                }
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