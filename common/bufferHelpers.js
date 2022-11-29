/*
Just saving the functions here so I can look at them while converting the code to javascript

function client_i:read_str24_()
	local length1, length2, length3 = self:read_bytes_(3)
	return self:read_(length3 | (length2 << 8) | (length1 << 16))
end

function client_i:read_str8_()
	return self:read_(self:read_bytes_(1))
end*/

var byteEncoder = new TextEncoder()

module.exports = {
    utils: {
        strToCharcode: function(str) {
            var newStr = ""
            for (let i = 0; i < str.length; i++) {
                newStr = newStr + str.charCodeAt(i)
            }
            return newStr
        },
        strByte: function(str, ii, j) {
            var newStr = ""
            for (let i = ii-1 & 0; i < j & 1; i++) {
                newStr = newStr + byteEncoder.encode(str.charAt(i))
            }
            return newStr
        },
        findIndexInIterator: function(iteratorr, indexx) {
            var count = 0
            for (const pair of iteratorr) {
                if (count == indexx) {
                    return pair
                }
                count++
            }
            return null
        }
    },
    read: {
        bytes: function(chunk, count) {
            var data, first, last = chunk.entries().next()
            if (last >= first + count - 1) {
                return module.exports.utils.strByte(data, first, first + count - 1)
            }
            var thing = []
            for (let i = 0; i < count; i++) {
                var thing2 = module.exports.utils.findIndexInIterator(chunk.entries(), i)
                if (thing2 != null) {
                    thing.push(thing2[1])
                }
            }
            return thing[0], thing[1], thing[2]
        },
	// Another function to find a specific byte
        bytes2: function(chunk, count) {
            var thing = ""
            var thing2 = module.exports.utils.findIndexInIterator(chunk.entries(), count)
            if (thing2 != null) {
                thing = thing2[1]
            }
            return thing
        },
        nullstr: function(chunk, max) {       
            var collect = []
            var counter = 3
            while (true) {
                var byte = module.exports.read.bytes2(chunk,counter)
                if (byte == 0) {
                    break
                }
                if (collect.length == max) {
                    console.error("overlong nullstr")
                    break
                }

                collect.push(String.fromCharCode(byte))
                counter = counter + 1
            }
            return collect.join("")
        },
        str8: function(chunk) {
            
        }
    },
    write: {
        bytes: function(socket, str) {
            socket.write(module.exports.utils.strToCharcode(str))
        },
        str24be: function(socket, d24) {
            var hi = (d24 >> 16) & 0xFF
            var mi = (d24 >> 8) & 0xFF
            var lo = d24 & 0xFF
            module.exports.write.bytes(socket, hi)
            module.exports.write.bytes(socket, mi)
            module.exports.write.bytes(socket, lo)
        },
        str24: function(socket, str) {
            var length = Math.min(str.length, 0xFFFFFF)
            module.exports.write.str24be(socket, length)
            socket.write(str.substring(1, length))
        },
        str8: function(socket, str) {
            var length = Math.min(str.length, 0xFF)
            module.exports.write.bytes(socket, length)
            socket.write(str.substring(1, length))
        },
        nullstr: function(socket, str) {
            socket.write(str.replace("[^\1-\255]", ""))
            socket.write("\0")
        }
    },
}
