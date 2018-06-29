const Scheduler = require('./Scheduler');
const Process = require('./Process');

// An example of a `main` function that adds a bunch of processes
// to the scheduler, randomly determining if they a running or 
// blocking process, and then runs the scheduler.
// Feel free to edit this file to execute your scheduler implemetation
// in a different way.
const main = () => {
    const scheduler = new Scheduler();

    for (let i = 1; i < 101; i++) {
        let rollForBlockingProcess = Math.random() < 0.25;
        let process = new Process(i + 1000, null, rollForBlockingProcess);//pid , cpuTimeNeeded, blocking
        scheduler.addNewProcess(process);
        scheduler.handleInterrupt(queue, null, null) // 3 parameters


    }
    // process.setParentQueue()
    // process.isFinished()
    // process.executeProcess(time)
    // process.executeBlockingProcess(time)
    // process.isStateChanged()
    // process.pid()



    scheduler.run();


};

main();

