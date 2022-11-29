// This code is what starts and monitors the server
// Although it's really bad and non-functional
var nodemon = require("nodemon")
var process = require("node:child_process")
var utilities = require("./common/utilities")


// https://nodejs.org/api/child_process.html#child_process_options_stdio
function startServer() {
    try {
        const cp = process.spawn('nodemon', [`${__dirname}\\server.js`, '--watch', `${__dirname}\\index.js`], {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
            stdout: false
        });

        cp.on("error", (err) => {
            utilities.serverLog(`An error happened in the process, see below for more info`, "custom", utilities.chalk.redBright("PROCESS ERROR"))
            console.trace(err)
        })
  
        return cp;
    } catch (err) {
        utilities.serverLog(`Error occurred during server start:\n${err}`, "custom", utilities.chalk.redBright("FATAL"))
    }
}

utilities.serverLog(`Nodemon process created`, "custom", utilities.chalk.green("NODEMON"))
var server = startServer();
  
server.on('message', function (event) {
    if (event.type === 'start') {
        utilities.serverLog(`Nodemon running`, "custom", utilities.chalk.green("NODEMON"))
    } else if (event.type === 'crash') {
        utilities.serverLog(`Nodemon crashed`, "custom", utilities.chalk.redBright("NODEMON CRASH"))
        //utilities.serverLog(`Error details: ${event}`, "custom", utilities.chalk.redBright("NODEMON CRASH"))
    } else if (event.type === 'exit') {
        utilities.serverLog(`Nodemon process stopped`, "custom", utilities.chalk.green("NODEMON"))
    }
});

server.on("readable", function () {
    server.stdout.pipe(fs.createWriteStream('output.txt'));
    server.stderr.pipe(fs.createWriteStream('err.txt'));
})
