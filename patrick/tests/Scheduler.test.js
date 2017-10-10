const sinon = require('sinon');
const Queue = require('../src/Queue');
const Process = require('../src/Process');
const Scheduler = require('../src/Scheduler');
const { 
    SchedulerInterrupt,
    QueueType,
} = require('../src/constants/index');

let queue, scheduler;

describe('Queue', () => {
    beforeEach(() => {
       scheduler = new Scheduler();
       queue = new Queue(scheduler, 50, 0, QueueType.CPU_QUEUE);
    });

    it('should have the methods "run", "allEmpty", "addNewProcess", and "emitInterrupt"', () => {
        expect(Object.getPrototypeOf(scheduler).hasOwnProperty('run')).toBe(true);
        expect(Object.getPrototypeOf(scheduler).hasOwnProperty('allEmpty')).toBe(true);
        expect(Object.getPrototypeOf(scheduler).hasOwnProperty('addNewProcess')).toBe(true);
        expect(Object.getPrototypeOf(scheduler).hasOwnProperty('emitInterrupt')).toBe(true);
    });

    it('should return true when "allEmpty" is called with no processes in any queues', () => {
        expect(scheduler.allEmpty()).toBe(true);
    });

    it('should add new processes to the top priority CPU queue when "addNewProcess" is called', () => {
        const process = new Process(0);
        scheduler.addNewProcess(process);
        const topPriorityLevelRunningQueue = scheduler._getCPUQueue(0);
        expect(topPriorityLevelRunningQueue.peek()).toBe(process);
    });

    it('should move a process to the blocking queue upon receiving a PROCESS_BLOCKED interrupt', () => {
        const process = new Process(0);
        const queue = scheduler._getBlockingQueue();
        const queueSpy = sinon.spy(queue, 'enqueue');
        scheduler.emitInterrupt(queue, process, SchedulerInterrupt.PROCESS_BLOCKED);
        expect(queueSpy.calledWith(process)).toBe(true);
    });

    it('should move a process to the top level priority queue upon receiving a PROCESS_READY interrupt', () => {
        const process = new Process(0);
        const queue = scheduler._getCPUQueue(0);
        const schedulerSpy = sinon.spy(scheduler, 'addNewProcess');
        scheduler.emitInterrupt(queue, process, SchedulerInterrupt.PROCESS_READY);
        expect(schedulerSpy.calledWith(process)).toBe(true);
    });

    it('should move a process to a lower priority level queue if the process was non-blocking, or back to the blocking queue if the process was blocking, upon receiving a LOWER_PRIORITY interrupt', () => {
        const process1 = new Process(0);
        const process2 = new Process(1);
        const topLevelQueue = scheduler._getCPUQueue(0);
        const nextLevelQueue = scheduler._getCPUQueue(1);
        const blockingQueue = scheduler._getBlockingQueue();
        scheduler.emitInterrupt(topLevelQueue, process1, SchedulerInterrupt.LOWER_PRIORITY);
        expect(nextLevelQueue.peek()).toBe(process1);

        scheduler.emitInterrupt(blockingQueue, process2, SchedulerInterrupt.LOWER_PRIORITY);
        expect(blockingQueue.peek()).toBe(process2);
    });

    it('should run until all processes have completed execution', () => {
        const process1 = new Process(0);
        const process2 = new Process(1, 0, true);
        const process3 = new Process(2, 500);

        const blockingQueue = scheduler._getBlockingQueue();
        const queue1 = scheduler._getCPUQueue(0);
        const queue2 = scheduler._getCPUQueue(1);
        const queue3 = scheduler._getCPUQueue(2);

        const schedulerSpy = sinon.spy(scheduler, 'allEmpty');
        const blockingQueueSpy = sinon.spy(blockingQueue, 'doBlockingWork');
        const queue1Spy = sinon.spy(queue1, 'doCPUWork');

        scheduler.addNewProcess(process1);
        scheduler.addNewProcess(process2);
        scheduler.addNewProcess(process3);
        scheduler.run();

        expect(blockingQueueSpy.called).toBe(true);
        expect(queue1Spy.called).toBe(true);
        expect(blockingQueue.isEmpty()).toBe(true);
        expect(schedulerSpy.called).toBe(true);
        expect(queue1.isEmpty()).toBe(true);
        expect(queue2.isEmpty()).toBe(true);
        expect(queue3.isEmpty()).toBe(true);
    });
});