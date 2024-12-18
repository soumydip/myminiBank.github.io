const cluster = require("cluster");
const os = require("os");

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master process ${process.pid} is running`);

  // Create workers equal to the number of CPU cores
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork(); // Declare the worker variable here
    worker.on('listening', (address) => {
      console.log(`Worker ${worker.process.pid} is listening on ${address.port}`);
    });
  }

  // Handle worker exit and restart
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new worker...`);
    cluster.fork();
  });
} else {
  // Worker processes run the Express app
  const express = require("express");
  const cookieParser = require("cookie-parser");
  const app = express();
  require("dotenv").config();
  const port = process.env.PORT || 4000; // Fallback to 5000 if PORT is not set
  const cors = require("cors");
  const userRoutes = require("./Routes/userRoutes");
  const amountControl = require("./Routes/amountControl");
  const pinControl = require("./Routes/pinControl");
  const helmet = require("helmet");

  const corsOptions = {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  };

  app.use(cors(corsOptions));
  app.use(helmet());

  // MongoDB connection
  const connectToMongo = require("./Others/db");
  connectToMongo();

  // Middleware: JSON Data Parsing
  app.use(express.json());
  app.use(cookieParser());

  // All Routes
  app.use("/api/user", userRoutes);
  app.use("/api/amount", amountControl);
  app.use("/api/pin", pinControl);

  // Global Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err); // Log error to console
    res.status(500).send({
      message: "Something went wrong!",
      error: err.message, // Send error message in response
    });
  });

  // Check if the server is running
  app.get("/", (req, res) => res.send(`Hello from Worker ${process.pid}!`));
  app.listen(port, () =>
    console.log(`Worker ${process.pid} is listening on port ${port}!`)
  );
}
