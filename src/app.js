const express = require("express");
const compression = require("compression");
const cors = require("cors");
const httpStatus = require("http-status");
const routes = require("./routes/v1");
const { errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const { jwtStrategy } = require("./config/passport");
const helmet = require("helmet");
const passport = require("passport");

const app = express();

// set security HTTP headers - https://helmetjs.github.io/
app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

app.use(cors());
app.options("*", cors());

app.use(passport.initialize());
passport.use(jwtStrategy);

app.use("/v1", routes);

app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

app.use(errorHandler);

module.exports = app;