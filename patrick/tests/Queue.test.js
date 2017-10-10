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
    
    it('should have the methods "enqueue", "dequeue", "peek", "getPriorityLevel", "getQueueType", "emitInterrupt", "isEmpty", "doCPUWork", "doBlockingWork", and "manageTimeSlice"', () => {
        expect(Object.getPrototypeOf(queue).hasOwnProperty('enqueue')).toBe(true);
        expect(Object.getPrototypeOf(queue).hasOwnProperty('dequeue')).toBe(true);
        expect(Object.getPrototypeOf(queue).hasOwnProperty('peek')).toBe(true);
        expect(Object.getPrototypeOf(queue).hasOwnProperty('getPriorityLevel')).toBe(true);
        expect(Object.getPrototypeOf(queue).hasOwnProperty('getQueueType')).toBe(true);
        expect(Object.getPrototypeOf(queue).hasOwnProperty('emitInterrupt')).toBe(true);
        expect(Object.getPrototypeOf(queue).hasOwnProperty('isEmpty')).toBe(true);
        expect(Object.getPrototypeOf(queue).hasOwnProperty('doCPUWork')).toBe(true);
        expect(Object.getPrototypeOf(queue).hasOwnProperty('doBlockingWork')).toBe(true);
        expect(Object.getPrototypeOf(queue).hasOwnProperty('manageTimeSlice')).toBe(true);
    });

    it('should enqueue a process and set its parent queue property correctly', () => {
        const process = new Process(0);
        queue.enqueue(process);
        expect(process._getParentQueue()).toBe(queue);
        expect(queue.peek()).toBe(process);
    });

    it('should return the most recently added process when peeking', () => {
        const process1 = new Process(0);
        const process2 = new Process(1);
        queue.enqueue(process1);
        queue.enqueue(process2);
        expect(queue.peek()).toBe(process1); 
    });

    it('should dequeue processes in first in first out order', () => {
        const process1 = new Process(0);
        const process2 = new Process(1);
        queue.enqueue(process1);
        queue.enqueue(process2);
        expect(queue.dequeue()).toBe(process1);
        expect(queue.peek()).toBe(process2);
    });

    it('should return the correct Queue type and priority level', () => {
        expect(queue.getQueueType()).toBe(QueueType.CPU_QUEUE);
        expect(queue.getPriorityLevel()).toBe(0);
    });

    it('should properly manage a child process that did not complete execution during the allotted time quantum', () => {
        const schedulerSpy = sinon.spy(scheduler, "emitInterrupt");
        const process = new Process(0, 60);
        queue.enqueue(process);
        queue.doCPUWork(51);
        expect(schedulerSpy.calledWith(queue, process, SchedulerInterrupt.LOWER_PRIORITY)).toBe(true);
    });

    it('should properly manage a child process that completed execution during the allotted time quantum', () => {
        const schedulerSpy = sinon.spy(scheduler, "emitInterrupt");
        const queueSpy = sinon.spy(queue, "manageTimeSlice");
        const process = new Process(0, 49);
        queue.enqueue(process);
        queue.doCPUWork(51);
        expect(queueSpy.calledWith(process, 51)).toBe(true);
        expect(schedulerSpy.getCalls().length).toBe(0);
    });

    it('should return true when `isEmpty` is called on an empty queue', () => {
        expect(queue.isEmpty()).toBe(true);
        const process = new Process(0);
        queue.enqueue(process);
        expect(queue.isEmpty()).toBe(false);
    });

    it('should remove the source process from the queue and emit the input interrupt to the scheduler', () => {
        const schedulerSpy = sinon.spy(scheduler, "emitInterrupt");
        const process1 = new Process(0);
        const process2 = new Process(1);
        queue.enqueue(process1);
        queue.enqueue(process2);
        queue.emitInterrupt(process1, SchedulerInterrupt.PROCESS_BLOCKED);
        expect(queue.peek()).toBe(process2);
        expect(schedulerSpy.calledWith(queue, process1, SchedulerInterrupt.PROCESS_BLOCKED)).toBe(true);
    });
});
