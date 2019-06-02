const Scheduler = require('./Scheduler');
const Process = require('./Process');

const main = () => {
    const scheduler = new Scheduler();

    for (let i = 1; i < 101; i++) {
        let rollForBlockingProcess = Math.random() < 0.25;
        scheduler.addNewProcess(new Process(i + 1000, null, rollForBlockingProcess));
    }

    scheduler.run();
};

main();
