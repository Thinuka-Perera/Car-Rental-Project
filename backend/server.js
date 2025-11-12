import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const PORT = 5000;
dotenv.config();

connectDB();

// Middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}))

//Routes
app.use('/api/auth',userRouter);

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