const express = require("express");
const cors = require("cors");

const app = express();
const port = 4000;

app.use(cors()); // This is here because of cross origin request errors
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded

app.use("/", require("./api/data"));

app.listen(port, () => {
	console.log(`started server at https://localhost:${port}`);
});
