const rp = require('request-promise');

async function sendMessage(message) {
  var discord = {
    method: 'POST',
    uri: process.env.DISCORD_EU_WEBHOOK,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      content: message,
    },
    json: true,
  };
  return await rp(discord);
}

module.exports.sendMessage = sendMessage;
