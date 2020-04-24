const express = require('express')
const bodyParser = require('body-parser');
const {FeedEmitter} = require('rss-emitter-ts');
const rp = require('request-promise');
const { execSync } = require('child_process');
const fs = require('fs-extra')
const fsPromises = fs.promises;
const path = require('path');
const os = require('os');

const app = express()
app.use(bodyParser.json());

const port = 3000

app.post('/github', (req, res) => {
  if (req.headers['x-github-event'] === 'status') {
    res.status(200).end();
    return;
  }
  if (req.headers['x-github-event'] === 'push') {
    res.status(200).end();
    return;
  }
  if (req.headers['x-github-event'] === 'issues') {
    res.status(200).end();
    return;
  }
  if (req.headers['x-github-event'] === 'issue_comment') {
    res.status(200).end();
    return;
  }
  if (req.headers['x-github-event'] === 'fork') {
    res.status(200).end();
    return;
  }
  if (req.headers['x-github-event'] === 'repository') {
    res.status(200).end();
    return;
  }
  if (req.headers['x-github-event'] === 'create') {
    res.status(200).end();
    return;
  }
  if (req.headers['x-github-event'] === 'label') {
    res.status(200).end();
    return;
  }
  if (req.headers['x-github-event'] === 'pull_request_review') {
    res.status(200).end();
    return;
  }
  if (req.headers['x-github-event'] === 'star') {
    res.status(200).end();
    return;
  }
  if (req.headers['x-github-event'] === 'watch') {
    res.status(200).end();
    return;
  }
  if (req.headers['x-github-event'] === 'pull_request') {
    if (req.body.action !== 'closed') {
      res.status(200).end();
      return;
    }
    if (req.body.pull_request.merged) {
      console.log('There we go, pull request merged');
      console.log(req.body.pull_request.title);
      console.log(req.body.repository.name);
      if (req.body.repository.name === 'server-skyblock-egg' || req.body.repository.name === 'server-survival-egg' ) {
        deploy('eu', req.body.repository.name);
      }
      res.status(200).end();
      return;
    }
  }
  console.log(req.headers);
  console.log(req.body);
  console.log(req.headers['x-github-event']);
  res.status(200).end();
})

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
module.exports = server;

const feeds = [
    { url: "https://github.com/cuberite/cuberite/commits/master.atom", refresh: 20000, ignoreFirst: true },
];
const emitter = new FeedEmitter();
emitter.on("item:new", (item) => {
    console.log(`New item: (${item.link})\n${item.title}\n${item.description}\n\n`);
    build();
});
feeds.forEach((feed) => emitter.add(feed));

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const deploy = async function(region, repository) {
  var discord = {
    method: 'POST',
    uri: process.env.DISCORD_EU_WEBHOOK,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      content: `Server will be updated ${region}:${repository}`,
    },
    json: true,
  };
  const responseStart = await rp(discord);


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
  const response = await rp(options);
  const date = new Date();
  const dir = `/backup/${repository}/${date.toISOString()}`
  await fs.mkdirSync(dir);
  await fs.copySync(`/srv/daemon-data/${response.attributes.uuid}`, dir);

  var optionsInfoMessage = {
    method: 'POST',
    uri: `https://greaper88.ddns.us:9907/api/client/servers/${response.attributes.identifier}/command/`,
    headers: {
      'Authorization': `Bearer ${process.env.PTERODACTYL_CLIENT_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'Application/vnd.pterodactyl.v1+json',
    },
    body: {
      command: 'Server will be restarted soonish',
    },
    json: true,
  };
  await rp(optionsInfoMessage);
  await sleep(60000);

  var optionsReinstall = {
    method: 'POST',
    uri: `https://greaper88.ddns.us:9907/api/application/servers/${response.attributes.id}/reinstall`,
    headers: {
      'Authorization': `Bearer ${process.env.PTERODACTYL_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'Application/vnd.pterodactyl.v1+json',
    },
    json: true,
  };
  await rp(optionsReinstall);

  for (i=0; i<1000; i++) {
    var optionsStatus = {
      method: 'GET',
      uri: `https://greaper88.ddns.us:9907/api/application/servers/external/${region}:${repository}`,
      headers: {
        'Authorization': `Bearer ${process.env.PTERODACTYL_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json',
      },
      json: true,
    };
    const status = await rp(optionsStatus);
    await sleep(5000);
    if (status.attributes.container.installed) {
      break;
    }
  }

  var optionsStart = {
    method: 'POST',
    uri: `https://greaper88.ddns.us:9907/api/client/servers/${response.attributes.identifier}/power/`,
    headers: {
      'Authorization': `Bearer ${process.env.PTERODACTYL_CLIENT_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'Application/vnd.pterodactyl.v1+json',
    },
    body: {
      signal: 'start',
    },
    json: true,
  };
  for (i=0; i<1000; i++) {
    try {
      const responseStart = await rp(optionsStart);
      break;
    } catch (e) {
      console.log(e);
    }
    await sleep(5000);
  }
}

// deploy('eu', 'server-skyblock-egg');

const build = async function() {
  const dir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'build-'));
  console.log(dir);
  const output = await execSync(`./build.sh ${dir}`);
  console.log(output.toString());
}

// build();
