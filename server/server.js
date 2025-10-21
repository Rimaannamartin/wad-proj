const express = require('express');
const dotenv = require('dotenv');
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


app.use('/api/v1/userAuth',userRoutes)



app.listen(PORT, (error) => {
    console.log(error);
    
    console.log(`Server running successfully at port ${PORT}`);
    
});



