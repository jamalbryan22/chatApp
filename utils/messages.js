const moment = require('moment')
const generateMessage = (username, text) => {
     return {
          username,
          text,
          createdAt: moment().format('h:mm:ss a')
     }
}

const generateLocationMessage = (username, url) => {
     return {
          username,
          url,
          createdAt: moment().format('h:mm:ss a')
     }
}

module.exports = {
     generateMessage,
     generateLocationMessage
}