const express = require("express");
const bodyParser = require("body-parser");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const app = express();
const port = 8000;

// Middleware to parse text/html bodies
app.use(bodyParser.text({ type: "text/html" }));

function htmlToJson(htmlString) {
  // Remove extra escaping if necessary
  // This might be redundant, but can help in debugging
  htmlString = htmlString.replace(/\\\"/g, '"');

  // Parse the HTML string into a DOM document using JSDOM
  const dom = new JSDOM(htmlString);
  const document = dom.window.document;

  // Get all the <option> elements
  const options = document.querySelectorAll("option");

  // Convert NodeList to Array and map it to an array of objects
  const optionsArray = Array.from(options).map((option) => ({
    value: option.getAttribute("value").replace(/\\\"/g, '"'), // Remove extra escaping
    text: option.textContent.trim(), // Use textContent and trim to clean up whitespace
  }));

  // Return the JSON representation
  return optionsArray;
}

app.post("/convert", (req, res) => {
  const htmlString = req.body;

  if (!htmlString) {
    return res.status(400).json({ error: "No HTML content provided" });
  }

  try {
    const jsonResult = htmlToJson(htmlString);
    res.setHeader("Content-Type", "application/json");
    res.json(jsonResult);
  } catch (error) {
    res.status(500).json({ error: "Error processing HTML" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
