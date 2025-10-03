const express = require("express");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

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

const app = express();
app.use(express.json());

// DB接続
const client = new Client({
  host: "db",
  user: "user",
  password: "password",
  database: "myapp",
  port: 5432,
});

client
  .connect()
  .then(() => console.log("Connected to Postgres"))
  .catch((err) => console.error("Connection error", err.stack));

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

app.listen(3000, () => console.log("Server running on port 3000"));

// const express = require("express");
// const { Client } = require("pg");

// const app = express();

// // DB接続設定（docker-compose.yml の設定に合わせる）
// const client = new Client({
//   host: "db",
//   user: "user",
//   password: "password",
//   database: "myapp",
//   port: 5432,
// });

// client
//   .connect()
//   .then(() => console.log("Connected to Postgres"))
//   .catch((err) => console.error("Connection error", err.stack));

// app.get("/", async (req, res) => {
//   try {
//     const result = await client.query("SELECT NOW()");
//     res.send(`Hello from Postgres! Server time is: ${result.rows[0].now}`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("DB query failed");
//   }
// });

// app.listen(3000, () => console.log("Server running on port 3000"));
