const express = require("express");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config();

// ログファイルのパス
const logPath = path.join("/usr/src/app/logs", "app.log");

// ストリームを作成（追記モード）
const logStream = fs.createWriteStream(logPath, { flags: "a" });

// console.log を上書きしてファイルにも出力
const origLog = console.log;
console.log = (...args) => {
  const msg = args.join(" ");
  logStream.write(`[LOG] ${new Date().toISOString()} ${msg}\n`);
  origLog(msg);
};

// console.error も同様に
const origError = console.error;
console.error = (...args) => {
  const msg = args.join(" ");
  logStream.write(`[ERR] ${new Date().toISOString()} ${msg}\n`);
  origError(msg);
};

// DB接続
const client = new Client({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT,
});

client
  .connect()
  .then(() => console.log("Connected to Postgres"))
  .catch((err) => console.error("Connection error", err.stack));

const app = express();
app.use(express.json());

// ルート：時刻を返す
app.get("/", async (req, res) => {
  const result = await client.query("SELECT NOW()");
  res.send(`Hello from Postgres! Server time is: ${result.rows[0].now}`);
});

// Create
app.post("/notes", async (req, res) => {
  const { text } = req.body;
  try {
    await client.query("INSERT INTO notes (text) VALUES ($1)", [text]);
    res.send("Note added successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Insert failed");
  }
});

// Read
app.get("/notes", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM notes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Query failed");
  }
});

// Update
app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  try {
    const result = await client.query(
      "UPDATE notes SET text = $1 WHERE id = $2 RETURNING *",
      [text, id]
    );
    if (result.rowCount === 0) {
      console.warn(`Update failed: Note with id=${id} not found`);
      res.status(404).send("Note not found");
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Update failed");
  }
});

// ▼ Delete
app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      "DELETE FROM notes WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).send("Note not found");
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
});

const port = process.env.APP_PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
