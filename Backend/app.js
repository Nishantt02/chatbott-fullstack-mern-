
import express from 'express';
import router from './Routes/UserRoutes.js';
import Chatroutes from './Routes/ChatRoutes.js';
import path from 'path';
import cors from 'cors';

const app = express();
const __dirname = path.resolve();

app.use(express.json());

app.use(cors());
// const corsOptions = {
//   origin: [
//    'https://fullstack-chatbott-21.onrender.com', 
//   'https://fullstack-chatbott-100.onrender.com'
//   ],
//    // Make sure this matches your frontend's deployed URL
//   methods: ['GET', 'POST','DELETE'],
//   credentials: true
// };
// app.use(cors(corsOptions));


// API routes
app.use('/User', router);
app.use('/Chat', Chatroutes);
app.get('/', (req, res) => {
  res.send('Backend server is running successfully 🚀');
});

// Serve frontend
// app.use(express.static(path.join(__dirname, "Frontend/dist")));

// // Catch-all for React/Vite frontend routing (Express 5 safe)
// app.use((req, res) => {
//    res.sendFile(path.join(__dirname, "Frontend/dist/index.html"));
// });

export default app;


