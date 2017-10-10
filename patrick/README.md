# Multi-Level Feedback Queue

- solution order: processes > queues > scheduler
- tests are kinda interdependent tho

### Motivation
After talking about one of the most popular scheduling algorithms used by operating systems to schedule processes,
let's implement it! This will be an implementation that simulates an actual multi-level feedback queue processing
blocking and non-blocking processes with multiple priority levels.

blocking processes go to blocking queue >> blocking time needed? counter: how much time it needs

### Reiterating on How Scheduling Works
One of the main jobs of operating system kernels is that they need to be able to execute all of the processes
running on your computer efficiently such that high priority processes are completed as quickly as possible,
while also ensuring that there is some fairness in how they schedule processes; even if a process is a low
priority, it eventually needs to complete execution.

In order to achieve this, schedulers iterate through all of the processes on your computer, grab the highest
priority process and execute it for a time quantum (a slice of time). Once the time quantum is up, the process has
either completed or it hasn't. If it hasn't, then the process is shunted to the next lower priority queue to
wait until it is its turn again. If the process completed during the initial time quantum, then it gets
discarded and the scheduler moves on to the next process in line.

One thing to note is that processes in higher priority queues are allocated less CPU time than processes in a
lower priority queue. The logic here is that the scheduler wants to get through as many of the short, high
priority processes first, then the long, high priority processes, followed by the short low priority processes,
before finally getting around to the long, low priority processes. Oftentimes, these long-running low priority
processes only get allocated CPU time when your computer is idle, since otherwise, new processes are constantly
being added to the scheduling queue.

### Setup - DONE √
Nothing special here. Just run `npm install` in the root directory, then start working on your implementation,
using the provided skeleton code and comments for guidance / pointers. Run `npm test` when you want to check
your code against the test suite, or `npm test:watch` if you'd like to keep the tests running as you work.

I am very, very saddened: https://www.npmjs.com/package/jest-nyan-reporter

### Architecture
![alt text](./assets/mlfq_diagram.png)

Our MLFQ implementation will comprise of two types of queues, blocking queues and CPU queues. There will be one
blocking queue and three CPU queues in our implementation. The blocking queue is where blocking processes go,
all other processes go in the CPU queues. Each queue will have a different priority level, with different time
quantums (which designate how much time each process in the associated queue receives from the CPU).

The blocking queue will have the highest priority (since we want to get through blocking processes as soon as
possible), followed by the three CPU queues. You'll be implementing three classes, a Process class to represent
blocking and non-blocking processes, a Queue class to represent the different types of queues, and a Scheduler
class to represent the scheduler itself. Then, inside `main.js` is where these classes will be executed to
simulate a scheduler working through processes.

Another important aspect that should be touched on is how queues, processes, and the scheduler all communicate
with each other. For example, a process may need to let the scheduler and its parent queue know that the process
has started a blocking operation, and thus needs to be moved to the blocking queue. Or conversely, a blocking
process will need to notify the scheduler and its queue that it has finished its blocking operation, and can thus
be moved to a CPU queue.

### Algorithm
The pseudo code for our MLFQ implementation is as follows:
```
Loop:
    If a process exists in the blocking queue:
        Work on removing each process in the blocking queue on a First Come First Serve basis
        Do blocking work (since we're in the blocking queue)
        When a process completes its blocking operation, emit an interrupt to the scheduler
        The scheduler removes the process from the blocking queue
        Adds it to the highest priority level CPU queue

    Iterate from the top priority CPU queue to the lowest priority CPU queue until we find a process
    If a process is found:
        Work on that process until the end of the queue's specified time quantum
            Do non-blocking work (since we're in the non-blocking CPU queues)
            If the process becomes blocking:
                Emit an interrupt to the scheduler notifying it that the process has become blocking
                The scheduler removes the now-blocking process from the CPU queue
                Places it on the blocking queue
                Restarts the time quantum with the next process in the CPU queue

        If the end of the time quantum has been reached:
            Remove the process that is currently being worked on from the top of the CPU queue
            If the process is not finished:
                If the process is already in the lowest priority queue:
                    Add it to the back of the same queue
                Else:
                    Add the process to the back of the next lower priority queue
```

### Further Reading
Here's a chapter from an operating systems textbook that dives a lot deeper into the theory and motivation behind
the multi-level feedback queue:
[http://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched-mlfq.pdf](http://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched-mlfq.pdf)
