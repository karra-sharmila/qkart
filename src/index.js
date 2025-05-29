const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");

let server;

const connectDB = () => {
    mongoose.connect(`${config.mongoose.url}`).then(()=> {
        console.log(`Connected to DB at ${config.mongoose.url}`);
        server = app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    }).catch((error) => {
        console.log("Failed to connect to DB",error);
    })
}

connectDB();
