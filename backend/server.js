const express = require("express");
const cors = require("cors");
const path = require("path");
const { execFile } = require("child_process");

const PORT = process.env.PORT || 5000;
const PYTHON = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
const SCRIPT = path.join(__dirname, "predict.py");
const MAX_URL_LENGTH = 2048;

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "10kb" }));

// Runs predict.py with the URL as a plain argument (no shell, so no injection).
function runModel(url) {
  return new Promise((resolve, reject) => {
    execFile(PYTHON, [SCRIPT, url], { timeout: 20000, windowsHide: true }, (err, stdout, stderr) => {
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(stderr || (err && err.message) || "Model returned no output"));
      }
    });
  });
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/analyze", async (req, res) => {
  const url = req.body && req.body.url;
  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ error: "Please enter a URL." });
  }
  if (url.length > MAX_URL_LENGTH) {
    return res.status(400).json({ error: "That URL is too long to analyse." });
  }

  try {
    const result = await runModel(url.trim());
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error("Model error:", err.message);
    res.status(500).json({ error: "The analysis service failed. Please try again." });
  }
});

app.listen(PORT, () => console.log(`PhishGuardAI API running on http://localhost:${PORT}`));
