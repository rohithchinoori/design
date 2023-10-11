const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database("./quiz.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY,
      text TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY,
      question_id INTEGER,
      text TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL
    )
  `);
});

// Insert a new question with options and correct answer
app.post("/api/questions", (req, res) => {
  const { question, options, correctAnswerIndex } = req.body;

  db.run("INSERT INTO questions (text) VALUES (?)", [question], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to insert question." });
    }

    const questionId = this.lastID;

    options.forEach((option, index) => {
      const isCorrect = index === correctAnswerIndex;
      db.run(
        "INSERT INTO options (question_id, text, is_correct) VALUES (?, ?, ?)",
        [questionId, option, isCorrect],
        function (err) {
          if (err) {
            return res.status(500).json({ error: "Failed to insert option." });
          }
        }
      );
    });

    res
      .status(201)
      .json({ message: "Question and options inserted successfully." });
  });
});

// Get all questions with their options
app.get("/api/fetchQuestions", (req, res) => {
  db.all("SELECT * FROM questions", (err, questions) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch questions." });
    }

    const questionsWithOptions = [];

    questions.forEach((question) => {
      db.all(
        "SELECT * FROM options WHERE question_id = ?",
        [question.id],
        (err, options) => {
          if (err) {
            return res.status(500).json({ error: "Failed to fetch options." });
          }

          questionsWithOptions.push({
            ...question,
            options,
          });

          if (questionsWithOptions.length === questions.length) {
            res.json(questionsWithOptions);
          }
        }
      );
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
