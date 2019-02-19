const express = require('express');
const helmet = require('helmet');
const knex = require('knex');

const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: './data/lambda.sqlite3'
  },
  useNullAsDefault: true
}
const db = knex(knexConfig);

const server = express();

server.use(express.json());
server.use(helmet());

// endpoints here

// list all zoos
server.get('/api/zoos', async (req, res) => {
  try {
    const zoos = await db('zoos');
    res.status(200).json(zoos);
  } catch (error) {
    res.status(500).json(error);
  }
});

// list zoo by id
server.get('/api/zoos/:id', async (req, res) => {
  try {
    const zoo = await db('zoos').where({ id: req.params.id });
    if (zoo.length < 1) {
      res.status(404).json({ message: 'No zoo with that id!' });
    } else {
      res.status(200).json(zoo);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
