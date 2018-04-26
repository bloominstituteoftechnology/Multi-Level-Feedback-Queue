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

            if (this.allQueuesEmpty()) {
                console.log("No more processes! I can sleep now.");
                break;
            }
        }
    }

    allQueuesEmpty() {
        return this.runningQueues.every(queue => queue.isEmpty()) && this.blockingQueue.isEmpty();
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
                /* More explicit way to write this logic */
                // if (queue.getQueueType() === QueueType.BLOCKING_QUEUE) {
                //     queue.enqueue(process);
                //     break;
                // }
                // const priority = queue.getPriorityLevel();
                // if (priority === PRIORITY_LEVELS - 1) {
                //     queue.enqueue(process);
                //     break;
                // }
                // this.runningQueues[priority + 1].enqueue(process);
                // break;
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

    _getCPUQueue(priorityLevel) {
        return this.runningQueues[priorityLevel];
    }

    _getBlockingQueue() {
        return this.blockingQueue;
    }
}

module.exports = Scheduler;
