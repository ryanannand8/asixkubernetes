const express = require('express');
const mongoose = require('mongoose');

const {
  MONGO_HOST, MONGO_PORT, MONGO_DB,
  MONGO_USER, MONGO_PASSWORD,
  APP_MESSAGE, PORT
} = process.env;

const uri = `mongodb://${MONGO_USER}:${encodeURIComponent(MONGO_PASSWORD)}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log(`Conectado a MongoDB en ${MONGO_HOST}:${MONGO_PORT}`))
  .catch(err => { console.error(err.message); process.exit(1); });

const Item = mongoose.model('Item', {
  texto: String,
  fecha: { type: Date, default: Date.now }
});

const app = express();
app.use(express.json());

app.get('/api/config', (req, res) =>
  res.json({ mensaje: APP_MESSAGE, mongoHost: MONGO_HOST, pod: process.env.HOSTNAME }));

app.get('/api/items', async (req, res) =>
  res.json(await Item.find().sort({ fecha: -1 })));

app.post('/api/items', async (req, res) =>
  res.status(201).json(await Item.create({ texto: req.body.texto })));

app.listen(PORT || 3000, () => console.log('Backend escuchando'));
