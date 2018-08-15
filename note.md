Scheduling

1 CPU(in this case for ease although there is usually more...that has 250 processes that time-share)

Context Switch
    * important mechanism that OS uses to allow scheduling to happen. 

    ---P1--->(S)CPU
    ---P2--->(S)CPU

    (S) == switch
        * address space is saved
        * instruction pointer - where in the program we are executing.

Given - list of processes that OS keeps track of 

XFairX

- let's keep track of this as a giant queue and give it to the CPU, 10 nanoseconds each. There are issues with this. One main problem is the notion of priority. There is no notion of priority in queues. So in this case even if a process comes a long that has a high priority, it won't mean anything to this data structure. The redeeming quality is that this process seeks socialism....everything is fair. everyone gets an equal number of turns. 

XTimeX
- processes take different amounts of time. Processes that take a short amount of time can be done first. If we do that we can get through a whole bunch more processes. Our turnaround will be really high but fairness will suffer. This won't work because we don't know how long things will take. 

Priority/Response Time

- certain processes have priority. We expect very quick feedback from our machine when we are using it. A scheduler needs to accommodate this. There is a process that is just waiting for I\O. 
    Processes that respond to input:
        - Fast feedback. Once they enter the scheduling system, they need to get turned around quickly. Executed quickly. 
        - Fast execution. They just need to respond to input. One keystroke equals one input. It's not one long running process. 
        - Scheduling scheme needs to strike a balance between priority, fairness and turnaround time. 

Multilevel Feedback Queue - data structure that strikes a pretty good balance between priority, fairness and turnaround time. 

We want fairness, which is why it's still a queue. It won't exhibit as much fairness as the first queue we talked about above. There will be compromise. 

We will have multiple queues. Qˆ1 through Qˆn. Each new process that comes in will initially get put into Qˆ1. Qˆ1 has the highest number priority. When a new process comes in, we will always assume that it's highest priority. The CPU will dequeue from Qˆ1 the highest priority element. If CPU takes from Qˆ2, Qˆ1 will have to be empty. 

Each queue will have a time quantum associated with it. High priority processes don't require a lot of time. When a long-running process comes in, it will get some time on the CPU because it's auto considered high priority. But if it runs for the specified time quantum of the queue and it's not done, it will be moved to the next queue. It will only get another go at the CPU when Qˆ1 is empty. 

If it does get run from Qˆn queue and Qˆ1 is empty, it does get more time. each queue gets a little more time as we get closer and closer to Qˆn. 

In addition to these numbered queues we have a blocking queue that is an even higher priority than Qˆ1. 


