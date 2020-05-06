const rp = require('request-promise');

async function getServerInfo(region, repository) {
  var options = {
    method: 'GET',
    uri: `https://greaper88.ddns.us:9907/api/application/servers/external/${region}:${repository}`,
    headers: {
      'Authorization': `Bearer ${process.env.PTERODACTYL_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'Application/vnd.pterodactyl.v1+json',
    },
    json: true,
  };
  return await rp(options);
}

module.exports.getServerInfo = getServerInfo;
