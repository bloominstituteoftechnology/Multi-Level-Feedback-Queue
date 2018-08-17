class Process {
    constructor(pid, cpuTimeNeeded = null) {
        this._pid = pid;
        this.cpuTimeNeeded = (cpuTimeNeeded !== null) ? cpuTimeNeeded : Math.round(Math.random() * 1000);
        this.allotment = Math.floor(Math.random() * 3 + 1);
        this.tickets = [];
    }
    get pid() {
        return this._pid;
    }

    isFinished() {
        return this.cpuTimeNeeded === 0;
    }
    executeProcess(time) {
        this.cpuTimeNeeded -= time;
        if (this.cpuTimeNeeded < 0) {
            this.cpuTimeNeeded = 0;
        }
    }
}
class Scheduler {
    constructor() {
        this.time = Date.now();
        this.processes = [];
        this.tickets = [...Array(100).keys()];
        this.winner = null;
        this.total_weight = 0;
    }
    run() {
        while (!this.processesFinished()) {
            console.log(`Number of processes: ${this.processes.length}\n`)
            console.log(`Tickets from scheduler: ${this.tickets}\n`)
            this.total_weight = 0;
            for (let i = 0; i < this.processes.length; i++) {
                this.total_weight += this.processes[i].allotment;
            }
            for (let i = 0; i < this.processes.length; i++) {
                this.allocate_tickets(this.processes[i])
            }
            let current = Date.now();
            let worktime = current - this.time;
            console.log(`Worktime: ${worktime}`)
            this.select_winner();
            for (let i = 0; i < this.processes.length; i++) {
                if (this.processes[i].tickets.includes(this.winner)) {
                    console.log(`The winner is ${this.processes[i]._pid}\n`)
                    console.log(`CPUTimeNeeded for winner before execution is: ${this.processes[i].cpuTimeNeeded}\n`)
                    this.processes[i].executeProcess(worktime);
                    console.log(`CPUTimeNeeded for winner after execution is: ${this.processes[i].cpuTimeNeeded}\n`)
                    if (this.processes[i].isFinished()) {
                        this.remove_process(this.processes[i]);
                    } else {
                        this.processes[i].tickets = [];
                    }
                } else {
                    this.processes[i].tickets = [];
                }
            }
            if (this.processesFinished()) {
                break;
            }
            this.time = Date.now();
            this.tickets = [...Array(100).keys()];
        }
    }

    allocate_tickets(process) {
        let process_tickets = [];
        let allotment = Math.floor((process.allotment / this.total_weight) * 100);
        for (let i = 0; i < allotment; i++) {
            let lotto = this.tickets[Math.floor(Math.random() * this.tickets.length)];
            while (process_tickets.includes(lotto)) {
                lotto = this.tickets[Math.floor(Math.random() * this.tickets.length)];
            }
            process_tickets.push(lotto);
        }
        process.tickets = process_tickets;
        console.log(`${process._pid}'s tickets: ${process.tickets}\n`)
        this.tickets = this.tickets.filter(num => !process_tickets.includes(num));
    }

    add_process(process) {
        this.processes.push(process);
        return process;
    }

    remove_process(process) {
        let processIndex = this.processes.findIndex(x => x._pid === process._pid);
        return this.processes.splice(processIndex, 1);
    }

    // move_to_front(process) {
    //     let processIndex = this.processes.indexOf(process);
    //     this.processes.unshift(process);
    //     this.processes.splice(processIndex, 1);
    // }

    processesFinished() {
        return (this.processes.length === 0);
    }

    select_winner() {
        this.winner = Math.floor(Math.random() * 100);
    }
}

const p1 = new Process(1);
const p2 = new Process(2);
const p3 = new Process(3);
const scheduler = new Scheduler();
scheduler.add_process(p1)
scheduler.add_process(p2);
scheduler.add_process(p3);
console.log(`***************Start of function**************`)
scheduler.run();