const SchedulerInterrupt = {
    PROCESS_BLOCKED: 'PROCESS_BLOCKED', // moving processes between ready queue and running que
    // when running becomes blocked
    PROCESS_READY: 'PROCESS_READY', // moving processes between ready queue and running que
    // blocking is no longer blocking
    LOWER_PRIORITY: 'LOWER_PRIORITY', // process didn't finish
}; // need to dispatch these in certain cases in order to notify the correct class (queue or scheduler) of something that happened

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

// in linux, theres was 250 :o
