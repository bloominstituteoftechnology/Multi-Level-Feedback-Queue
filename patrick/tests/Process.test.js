const sinon = require('sinon');
const Queue = require('../src/Queue');
const Process = require('../src/Process');
const Scheduler = require('../src/Scheduler');
const { 
    SchedulerInterrupt,
    QueueType,
} = require('../src/constants/index');

let queue, scheduler;

describe('Process', () => {
    beforeEach(() => {
        scheduler = new Scheduler();
        queue = new Queue(scheduler, 50, 0, QueueType.CPU_QUEUE);
    });

    it('should have the methods "setParentQueue", "isFinished", "executeProcess", "executeBlockingProcess", "isStateChanged", and "get pid"', () => {
        const process = new Process(0);
        expect(Object.getPrototypeOf(process).hasOwnProperty('setParentQueue')).toBe(true);
        expect(Object.getPrototypeOf(process).hasOwnProperty('isFinished')).toBe(true);
        expect(Object.getPrototypeOf(process).hasOwnProperty('executeProcess')).toBe(true);
        expect(Object.getPrototypeOf(process).hasOwnProperty('executeBlockingProcess')).toBe(true);
        expect(Object.getPrototypeOf(process).hasOwnProperty('isStateChanged')).toBe(true);
        expect(Object.getPrototypeOf(process).hasOwnProperty('pid')).toBe(true);
    });

    it("should return the process's correct pid", () => {
        const pid = Math.round(Math.random() * 10000);
        const process = new Process(pid);
        expect(process.pid).toBe(pid);
    });

    it('should have its parent queue correctly assigned when "setParentQueue" is called', () => {
        const process = new Process(0);
        process.setParentQueue(queue);
        expect(process._getParentQueue()).toBe(queue);
    });

    it('should finish a process when the process is given enough CPU time', () => {
        const process1 = new Process(0, 30);
        const process2 = new Process(0, 30);
        queue.enqueue(process1);
        queue.enqueue(process2);
        process1.executeProcess(30);
        process2.executeProcess(29);
        expect(process1.isFinished()).toBe(true);
        expect(process2.isFinished()).toBe(false);
    });

    it("should emit a PROCESS_READY interrupt and change the process's state when a blocking process completes its blocking execution", () => {
        const blockingProcess = new Process(0, 0, true);
        const queueSpy = sinon.spy(queue, 'emitInterrupt');
        queue.enqueue(blockingProcess);
        blockingProcess.executeBlockingProcess(1000);
        expect(queueSpy.calledWith(blockingProcess, SchedulerInterrupt.PROCESS_READY));
        expect(blockingProcess.isStateChanged()).toBe(true);
    });
});