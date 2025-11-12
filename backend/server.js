import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoutes.js';

import path from 'path';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import carRouter from './routes/carRoutes.js';

const app = express();
const PORT = 5000;
dotenv.config();

// Get the current file name
const __filename = fileURLToPath(import.meta.url);

// Get the current directory name
const __dirname = path.dirname(__filename); 

connectDB();

// Middleware
app.use(cors());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any frontend to access
    next();
  },
  express.static(path.join(process.cwd(), 'uploads'))
);

//Routes
app.use('/api/auth',userRouter);
app.use('/api/cars',carRouter);

app.get('/api/ping', (req, res) => res.json({
    ok:true,
    time: Date.now()
}))


//Listen
app.get('/',(req, res)=>{
    res.send('API Working')
});

app.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${PORT}`)
})