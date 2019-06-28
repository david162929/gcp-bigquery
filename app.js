const express = require("express");
const bodyParser = require("body-parser");


const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// static files
app.use("/static", express.static("public"));

// require routes
const mainRoutes = require("./routes/main.js");

app.use(mainRoutes);


app.listen(3000, () => {
    console.log("running on port 3000.");
});
