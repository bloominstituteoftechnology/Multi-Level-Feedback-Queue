const sinon = require('sinon');
const Queue = require('../src/Queue');
const Process = require('../src/Process');
const Scheduler = require('../src/Scheduler');
const { 
    SchedulerInterrupt,
    QueueType,
} = require('../src/constants/index');

let queue, scheduler;

describe('Priority Boosting', () => {
    beforeEach(() => {
       scheduler = new Scheduler();
       queue = new Queue(scheduler, 50, 0, QueueType.CPU_QUEUE);
    });

    // it('should have the methods "run", "allEmpty", "addNewProcess", and "handlInterrupt"', () => {
    //     expect(Object.getPrototypeOf(scheduler).hasOwnProperty('run')).toBe(true);
    //     expect(Object.getPrototypeOf(scheduler).hasOwnProperty('allEmpty')).toBe(true);
    //     expect(Object.getPrototypeOf(scheduler).hasOwnProperty('addNewProcess')).toBe(true);
    //     expect(Object.getPrototypeOf(scheduler).hasOwnProperty('handleInterrupt')).toBe(true);
    // });

    // it('should return true when "allEmpty" is called with no processes in any queues', () => {
    //     expect(scheduler.allEmpty()).toBe(true);
    // });

    // it('should add new processes to the top priority CPU queue when "addNewProcess" is called', () => {
    //     const process = new Process(0);
    //     scheduler.addNewProcess(process);
    //     const topPriorityLevelRunningQueue = scheduler._getCPUQueue(0);
    //     expect(topPriorityLevelRunningQueue.peek()).toBe(process);
    // });

    // it('should move a process to the blocking queue upon receiving a PROCESS_BLOCKED interrupt', () => {
    //     const process = new Process(0);
    //     const queue = scheduler._getBlockingQueue();
    //     const queueSpy = sinon.spy(queue, 'enqueue');
    //     scheduler.handleInterrupt(queue, process, SchedulerInterrupt.PROCESS_BLOCKED);
    //     expect(queueSpy.calledWith(process)).toBe(true);
    // });

    // it('should move a process to the top level priority queue upon receiving a PROCESS_READY interrupt', () => {
    //     const process = new Process(0);
    //     const queue = scheduler._getCPUQueue(0);
    //     const schedulerSpy = sinon.spy(scheduler, 'addNewProcess');
    //     scheduler.handleInterrupt(queue, process, SchedulerInterrupt.PROCESS_READY);
    //     expect(schedulerSpy.calledWith(process)).toBe(true);
    // });

    // it('should move a process to a lower priority level queue if the process was non-blocking, or back to the blocking queue if the process was blocking, upon receiving a LOWER_PRIORITY interrupt', () => {
    //     const process1 = new Process(0);
    //     const process2 = new Process(1);
    //     const topLevelQueue = scheduler._getCPUQueue(0);
    //     const nextLevelQueue = scheduler._getCPUQueue(1);
    //     const blockingQueue = scheduler._getBlockingQueue();
    //     scheduler.handleInterrupt(topLevelQueue, process1, SchedulerInterrupt.LOWER_PRIORITY);
    //     expect(nextLevelQueue.peek()).toBe(process1);

    //     scheduler.handleInterrupt(blockingQueue, process2, SchedulerInterrupt.LOWER_PRIORITY);
    //     expect(blockingQueue.peek()).toBe(process2);
    // });
    // it('should move all processes to the highest priority level queue if the process was non-blocking and 600ms has expired , or back to the blocking queue if the process was blocking, upon receiving a LOWER_PRIORITY interrupt', () => {
    //     const process1 = new Process(0, 1000);
    //     const process2 = new Process(1,100);
    //     const topLevelQueue = scheduler._getCPUQueue(0);
    //     const nextLevelQueue = scheduler._getCPUQueue(1);
    //     const blockingQueue = scheduler._getBlockingQueue();
    //     scheduler.handleInterrupt(topLevelQueue, process1, SchedulerInterrupt.LOWER_PRIORITY);
    //     expect(nextLevelQueue.peek()).toBe(process1);

    //     scheduler.handleInterrupt(blockingQueue, process2, SchedulerInterrupt.LOWER_PRIORITY);
    //     expect(blockingQueue.peek()).toBe(process2);
    // });

    it('should run until all processes have completed execution', () => {
        const process0 = new Process(100, 50);
        const process1 = new Process(101, 100);  //      
        const process2 = new Process(102, 1000, true);
        process2.blockingTimeNeeded += 1000; // ensure that it doen't get on priority 0 queue


        const blockingQueue = scheduler._getBlockingQueue();
        const queue0 = scheduler._getCPUQueue(0);
        const queue1 = scheduler._getCPUQueue(1);
        const queue2 = scheduler._getCPUQueue(2);

        const schedulerSpy = sinon.spy(scheduler, 'allEmpty');
        const blockingQueueSpy = sinon.spy(blockingQueue, 'doBlockingWork');
        const queue1Spy = sinon.spy(queue0, 'doCPUWork');

        scheduler.addNewProcess(process0);
        scheduler.addNewProcess(process1);
        scheduler.addNewProcess(process2);
        scheduler.run();

        const process0Found = (scheduler._boostedQueues().indexOf(process0) >= 0);
        const process1Found = (scheduler._boostedQueues().indexOf(process1) >= 0);
        const process2Found = (scheduler._boostedQueues().indexOf(process2) >= 0);

        expect(blockingQueueSpy.called).toBe(true);
        expect(queue1Spy.called).toBe(true);
        expect(blockingQueue.isEmpty()).toBe(true);
        expect(schedulerSpy.called).toBe(true);
        expect(process0Found).toBe(false);
        expect(process1Found).toBe(false);
        expect(process2Found).toBe(true);
        expect(scheduler. _boostedQueues().length).toBe(1);
        expect(queue0.isEmpty()).toBe(true);
        expect(queue1.isEmpty()).toBe(true);
        expect(queue2.isEmpty()).toBe(true);
    });
});
