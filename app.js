const express = require('express');
const app = express();
const connectDb = require('./db/connect');
const cors = require('cors');
const menuRouter = require('./routes/menuRoutes');
const orderRouter = require('./routes/order');
const router = require('./routes/User')
const profilePictureRouter = require('./routes/profilePictureRoutes')

// Middlweware
require('dotenv').config();
connectDb(); //CONNECT TO THE DATABASE
app.use(cors());
app.use(express.json());
// ROUTES
app.use(menuRouter);
app.use(orderRouter);
app.use(profilePictureRouter);
app.use('/auth',router)

app.get('/', (req, res => {
    res.send('Server is running')
}))
const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
