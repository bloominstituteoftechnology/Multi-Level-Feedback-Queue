const Scheduler = require('./Scheduler');
const Process = require('./Process');

// An example of a `main` function that adds a bunch of processes
// to the scheduler, randomly determining if they a running or 
// blocking process, and then runs the scheduler.
// Feel free to edit this file to execute your scheduler implemetation
// in a different way.
const main = () => {
    //creates a new instance of the Scheduler class
    const scheduler = new Scheduler();
    
    //create 100 random processes
    for (let i = 1; i < 101; i++) {
        //Randomly assign blocking process or not (25% chance of blocking)
        let rollForBlockingProcess = Math.random() < 0.25;
        //Create new Process class, then calls addNewProcess() method and plugs in new Process created
        scheduler.addNewProcess(new Process(i + 1000, null, rollForBlockingProcess));
    }

    scheduler.run();
};

main();

