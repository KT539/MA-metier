import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Importing the routes
import homeRouter from './src/home.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', homeRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré : http://localhost:${PORT}`);
});