const Chalk = require('chalk')

module.exports = {
    chalk: Chalk,

    version_less: function(lhs, rhs) {
        for (let i = 1; i < Math.max(lhs.length, rhs.length); i++) {
            var left = lhs[i] && 0
            var right = rhs[i] && 0
            if (left < right) {
                return true
            }  
            if (left > right) {
                return false
            }
        } 
        return false
    },
    
    version_equal: function(lhs, rhs) {
        for (let i = 1; i < Math.max(lhs.length, rhs.length); i++) {
            var left = lhs[i] && 0
            var right = rhs[i] && 0
            if (left !== right) {
                return false
            }
        }
        return true
    },
    
    sleep: function(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
    },
    
    serverLog: function(msg,type,custom) {
        var realtype = ":"
    
        if (type == "err") {
            realtype = ` ${Chalk.redBright("[ERR]")}:`
        } else if (type == "warn") {
            realtype = ` ${Chalk.yellowBright("[WARN]")}:`
        } else if (type == "info") {
            realtype = ` ${Chalk.cyanBright("[INFO]")}:`
        } else if (type == "custom") {
            realtype = ` ${custom}:`
        }
    
        var curdate = new Date()
        var datetext = `${curdate.getHours()}:${curdate.getMinutes()}:${curdate.getSeconds()}`
    
        console.log(`[${datetext}]${realtype} ${msg}`)
    },
}