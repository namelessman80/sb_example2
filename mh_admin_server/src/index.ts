import express from "express";
import { checkDbConnection } from "./db";
import routes from "./routes";
import environments from "./environments";

const app = express();
const PORT = environments.PORT || 8000;

const startServer = async () => {
    await checkDbConnection();

    routes(app);

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
};

startServer();
