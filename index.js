const express=require('express')
const cors=require('cors')

require('dotenv').config();
const connectdb=require('./mongodb/connect');
const authRoutes = require('./Routes/authRoutes')
const sessionRoutes = require('./Routes/sessionRoutes');

const port=process.env.PORT || 8080;

const app=express();
app.use(express.json({ limit: '50mb' }))
app.use(cors())
app.use('/auth',authRoutes);
app.use('/session',sessionRoutes);
const startServer = async () => {
    try {
      connectdb.connectdb(process.env.MONGO_URL);
      app.listen(port, () => console.log('Server started on port 8080'));
    } catch (error) {
      console.log(error);
    }
  };

startServer();

app.get('/',(req,res)=>{
    res.send('hello world')
})