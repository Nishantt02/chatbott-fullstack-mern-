
import express from 'express';
import router from './Routes/UserRoutes.js';
import Chatroutes from './Routes/ChatRoutes.js';
import path from 'path';
import cors from 'cors';

const app = express();
const __dirname = path.resolve();

app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
// API routes
app.use('/User', router);
app.use('/Chat', Chatroutes);
app.get('/', (req, res) => {
  res.send('Backend server is running successfully 🚀');
});


if(process.env.NODE_ENV==='production'){
   app.use(express.static(path.join(__dirname, "Frontend/dist")));
   app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"../Frontend","dist","index.html"))
   })
}

export default app;

