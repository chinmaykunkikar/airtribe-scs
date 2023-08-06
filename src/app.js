const express = require("express");
const helmet = require("helmet");
const routes = express.Router();
const { PORT: ENV_PORT } = require("./configs/env.config");
const userRoutes = require("./routes/user.route");
const fileRoutes = require("./routes/file.route");
const sequelize = require("./configs/sequelize.config");
// const db = require("./models");
const umzug = require("./utils/migrations.util"); // Create this file to handle migrations

let PORT;
const app = express();

app.use(helmet());
app.use(routes);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (_, res) => {
  res.status(200).send("<h2>Simple Cloud Storage Backend</h2>");
});

// db.sequelize.sync();

app.use("/api/user", userRoutes);
app.use("/api/file", fileRoutes);

ENV_PORT !== "" && !isNaN(ENV_PORT) ? (PORT = ENV_PORT) : (PORT = 3000);

// app
//   .listen(PORT, (error) => {
//     if (!error) console.log("Server is running on port " + PORT);
//   })
//   .on("error", (error) => console.error("Cannot start the server\n", error));

async function startServer() {
  try {
    // Run pending migrations using umzug
    await umzug.up();

    // Start the server
    app
      .listen(PORT, (error) => {
        if (!error) console.log("Server is running on port " + PORT);
      })
      .on("error", (error) =>
        console.error("Cannot start the server\n", error)
      );
  } catch (err) {
    console.error("Error running migrations:", err);
  }
}

startServer();

module.exports = app;
