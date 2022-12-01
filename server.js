var utilities = require("./common/utilities")
var bufferHelpers = require("./common/bufferHelpers")

var net = require("net")
var server = net.createServer()

var config = {
    version: 27,
    version_min: [96, 2],
    version_max: [96, 2],

    allowServerJoining: {
        enabled: false,
        reason: "You are trying to join a TPTMP-js server. We'd like to inform you that this type of server isn't complete." // Kick reason if false
    },

    // TODO: do these stuff later (when i get uid stuff working)
    whitelist: {
        enabled: false,
        entries: []
    },
    blacklist: {
        enabled: true,
        entries: []
    }
}

var clients = []
function insert_client(details) {
    var client = {
        name: details.nick,
        uid: details.uid,
        token: details.token,
        socket: details.socket,
        isAGuest: details.guest
    }

    clients.push(client)

    client.socket.once("close", () => {
        utilities.serverLog(`${client.name} dropped`, "custom", utilities.chalk.white(`CLIENT ${client.name} (${client.uid})`))    
        for (let client2 in clients) {
            if (client2.name == client.name) {
                // TODO: Need to find a way to remove the client table in the clients array
            }
        }
    })
    client.socket.on("error", (err) => {
        utilities.serverLog(`${client.name} (${client.uid}) errored.`, "custom", utilities.chalk.redBright("CLIENT ERROR"))
        console.trace(err)
    })
    client.socket.on('data', (chunk) => { 
        if (chunk.toString().length <= 255) {
            utilities.serverLog(`Received data: ${chunk.toString()}`, "custom", utilities.chalk.white("SERVER"))
        } else {
            utilities.serverLog(`Received data, but it's too long`, "custom", utilities.chalk.white("SERVER"))
        }
    });
}

function attempt_handshake(socket, chunk) {
    var tpt_major, tpt_minor, version = bufferHelpers.read.bytes(chunk, 3)
    var nick = bufferHelpers.read.nullstr(chunk, 255)
    console.log(`Initial nick is ${nick}`)

    var tpt_version = { tpt_major, tpt_minor }
	var version_ok = config.version

    if (version !== version_ok) {
        return ["protocol version mismatch; try updating TPTMP, or if it is built into your mod, install it from the Online tab in the Script Manager"]
    }
    if (utilities.version_less(tpt_version, config.version_min)) {
        return ["TPT version older than first compatible; try updating TPT"]
    }
    if (utilities.version_less(config.version_max, tpt_version)) {
        return ["TPT version newer than last compatible; contact the server owner"]
    }

    return ["ok", nick]
}

// SERVER FUNCTIONS
function kickPlayer(socket, reason) {
    socket.write("\2")
    bufferHelpers.write.str8(socket, reason)
    socket.destroy()
}

// MAIN SERVER STUFF
utilities.serverLog(`Starting server`, "custom", utilities.chalk.white("SERVER"))

server.on('connection', async (socket) => {
    utilities.serverLog(`IP is attempting connection`, "custom", utilities.chalk.white("SERVER"));

    var clientName = "client-" + socket.remoteAddress

    // We need the data only once
    socket.once('data', (chunk) => {
        if (config.allowServerJoining.enabled == true) {
            utilities.serverLog(`Received data: ${chunk.toString()}`, "custom", utilities.chalk.white("SERVER"))
            var handshake = attempt_handshake(socket, chunk)
            if (handshake[0] !== "ok") {
                utilities.serverLog(`Handshake for client ${clientName} failed`, "custom", utilities.chalk.redBright("SERVER ERROR"))
                utilities.serverLog(`Failure reason: ${handshake[0]}`, "custom", utilities.chalk.redBright("SERVER ERROR"))
            
                socket.write("\0")
                bufferHelpers.write.nullstr(socket, handshake[0])
                socket.destroy()
            } else if (handshake[0] == "ok") {
                utilities.serverLog(`Handshake for client ${clientName} succeeded`, "custom", utilities.chalk.white("SERVER"))
    
                socket.write("\1")
                bufferHelpers.write.str8(socket, handshake[1])
                socket.write("0")

                // TODO: Get the client to actually know they succeeded with the handshake
                // Why? The client doesn't even know the handshake succeeded.
                
                clientName = "client-" + handshake[1]
                insert_client({
                    nick: handshake[1],
                    guest: 0,
                    socket: socket,
                    uid: "0",
                    token: "0"
                })
            }
        } else if (config.allowServerJoining.enabled == false) {
            utilities.serverLog(`${bufferHelpers.read.nullstr(chunk, 255)} tried to join the server!`, "custom", utilities.chalk.white("SERVER"))

            socket.write("\0")
            bufferHelpers.write.nullstr(socket, config.allowServerJoining.reason)
            socket.destroy()
        }
    });
})

server.listen(3000, () => {
    utilities.serverLog(`Server is listening on ${server.address().address}:${server.address().port}`, "custom", utilities.chalk.white("SERVER"))
})

server.once("close", () => {
    console.log("Server shutdown triggered")

    for (let client in clients) {
        kickPlayer(client.socket, "server closed")
    }

    console.log("Shutdown done, process closing")
    process.exit()
})
