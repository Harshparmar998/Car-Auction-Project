import express from "express";
import next from "next";
import checkExpiredAuctions from "./src/pages/api/checkAuctions"; // Import function

import dotenv from 'dotenv';
import dotenvExpand from "dotenv-expand";

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();


app.prepare().then(() => {
    const server = express();

    // Start checking auctions every 5 minutes
    checkExpiredAuctions();

    server.all("*", (req, res) => handle(req, res));

    server.listen(process.env.APP_PORT, () => {
        console.log("🚀 Server running on http://localhost:3000");
    });
});
