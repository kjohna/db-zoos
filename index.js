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
const errors = {
  '19': 'Another record with that value exists'
}

const server = express();

server.use(express.json());
server.use(helmet());

// endpoints here

// list all table data
server.get('/api/:table', async (req, res) => {
  const table = req.params.table
  console.log('table: ', table);
  try {
    const data = await db(table);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// list table data by id
server.get('/api/:table/:id', async (req, res) => {
  const table = req.params.table
  try {
    const data = await db(table)
      .where({ id: req.params.id })
      .first();
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: `No ${table} data with that id!` });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// add zoo
server.post('/api/zoos', async (req, res) => {
  try {
    const [id] = await db('zoos').insert(req.body);
    const newZoo = await db('zoos')
      .where({ id: id })
      .first();
    res.status(201).json(newZoo);
  } catch (error) {
    const msg = errors[error.errno] || error;
    res.status(500).json({ message: msg });
  }
});

// update zoo
server.put('/api/zoos/:id', async (req, res) => {
  try {
    const numUpdated = await db('zoos')
      .where({ id: req.params.id })
      .update(req.body);
    if (numUpdated > 0 ) {
      const updatedZoo = await db('zoos')
        .where({ id: req.params.id })
        .first();
      res.status(200).json(updatedZoo);
    } else {
      res.status(404).json({ message: 'No zoo with that id!' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete zoo
server.delete('/api/zoos/:id', async (req, res) => {
  try {
    const numDeleted = await db('zoos')
      .where({ id: req.params.id })
      .del();
    if (numDeleted > 0) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'No zoo with that id!' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
