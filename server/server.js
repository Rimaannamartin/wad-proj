const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDb = require("./config/connect")
const userRoutes = require('./routes/userRoutes')
const session = require("express-session");


dotenv.config();

connectDb()
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form submissions

app.use(session({

    secret:"supersecreatkey",
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false}


}))
const cors = require("cors");
app.use(cors({ origin: "http://localhost:5000", credentials: true }));

// Serve static files from client folder
app.use(express.static(path.join(__dirname, '../client')));

// Serve index.html as root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use('/api/v1/userAuth',userRoutes)



app.listen(PORT, (error) => {
    console.log(error);
    
    console.log(`Server running successfully at port ${PORT}`);
    
});



