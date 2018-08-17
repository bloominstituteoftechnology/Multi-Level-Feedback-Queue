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
        return this.isFinished();
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
            this.total_weight = 0;
            for (let i = 0; i < this.processes.length; i++) {
                this.total_weight += this.processes[i].allotment;
            }
            for (let i = 0; i < this.processes.length; i++) {
                this.allocate_tickets(this.processes[i])
            }
            let current = Date.now();
            let worktime = current - this.time;
            this.select_winner();
            for (let i = 0; i < this.processes.length; i++) {
                if (this.processes[i].tickets.includes(this.winner)) {
                    this.processes[i].executeProcess(worktime);
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
        this.tickets = this.tickets.filter(num => !process_tickets.includes(num));
    }

    add_process(process) {
        this.processes.push(process);
        return process;
    }

    remove_process(process) {
        let processIndex = this.processes.indexOf(process);
        this.processes.splice(processIndex, 1);
    }

    move_to_front(process) {
        let processIndex = this.processes.indexOf(process);
        this.processes.unshift(process);
        this.processes.splice(processIndex, 1);
    }

    processesFinished() {
        return (this.processes.length === 0);
    }

    select_winner() {
        this.winner = Math.floor(Math.random() * 100);
    }
}

let p1 = new Process(1);
let p2 = new Process(2);
let p3 = new Process(3);
let scheduler = new Scheduler();
scheduler.add_process(p1)
scheduler.add_process(p2);
scheduler.add_process(p3);
scheduler.run();