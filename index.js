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
  const table = req.params.table;
  try {
    const data = await db(table);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// list table data by id
server.get('/api/:table/:id', async (req, res) => {
  const table = req.params.table;
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

// add item to table
server.post('/api/:table', async (req, res) => {
  const table = req.params.table;
  try {
    const [id] = await db(table).insert(req.body);
    const newItem = await db(table)
      .where({ id: id })
      .first();
    res.status(201).json(newItem);
  } catch (error) {
    const msg = errors[error.errno] || error;
    res.status(500).json({ message: msg });
  }
});

// update table item by id
server.put('/api/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  try {
    const numUpdated = await db(table)
      .where({ id: id })
      .update(req.body);
    if (numUpdated > 0 ) {
      const updatedItem = await db(table)
        .where({ id: id })
        .first();
      res.status(200).json(updatedItem);
    } else {
      res.status(404).json({ message: `No ${table} item with that id!` });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete item from table by id
server.delete('/api/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  try {
    const numDeleted = await db(table)
      .where({ id: id })
      .del();
    if (numDeleted > 0) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: `No ${table} item with that id!` });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
