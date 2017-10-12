const SchedulerInterrupt = {
    PROCESS_BLOCKED: 'PROCESS_BLOCKED',
    PROCESS_READY: 'PROCESS_READY',
    LOWER_PRIORITY: 'LOWER_PRIORITY',
};

const QueueType = {
    CPU_QUEUE: 'CPU_QUEUE',
    BLOCKING_QUEUE: 'BLOCKING_QUEUE',
};

const PRIORITY_LEVELS = 3;

module.exports = {
    SchedulerInterrupt,
    QueueType,
    PRIORITY_LEVELS,
};
