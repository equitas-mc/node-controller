const express = require('express')
const bodyParser = require('body-parser');
const {FeedEmitter} = require('rss-emitter-ts');
const rp = require('request-promise');

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
  console.log(req.headers);
  console.log(req.body);
  console.log(req.headers['x-github-event']);
  res.send('Hello World!')
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
});
feeds.forEach((feed) => emitter.add(feed));

const deploy = async function(repository) {
  var options = {
    method: 'GET',
    uri: `https://greaper88.ddns.us:9907/api/application/servers/external/${repository}`,
    headers: {
      'Authorization': `Bearer ${process.env.PTERODACTYL_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'Application/vnd.pterodactyl.v1+json',
    },
    json: true,
  };
  const response = await rp(options);
  console.log(JSON.stringify(response, null, 2));
}

deploy('eu-server-skyblock-egg');
