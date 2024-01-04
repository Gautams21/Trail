const express = require("express");
const bcrypt=require('bcrypt');
const app= express();
const ejs=require("ejs");
const path=require("path");
const Schema=require("./models/Schema");
const Database=require("./database/Database");
const port=3001;
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine","ejs"); 

app.get('/login',(req,res)=>{    
    res.render("login");   
})     
 
app.get('/signup',(req,res)=>{
    res.render("signup"); 
})

app.post('/signup', async (req, res) => {
    try {
        const existingUser = await Schema.findOne({ email: req.body.email });

        if (existingUser) {
            // User already exists, render a message or redirect
            return res.render("signup", { message: "User already exists with this email." });
        }

        const salt = await bcrypt.genSalt(10);
        const secpass = await bcrypt.hash(req.body.password, salt);

        let data = await Schema.create({
            name: req.body.name,
            email: req.body.email,
            password: secpass
        });

        // Redirect to the login page after successful signup
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', async (req, res) => {
    try {
        const user = await Schema.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).send('Invalid email or password');
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if (!validPassword) {
            return res.status(400).send('Invalid email or password');
        }

        res.render("home");

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

Database;
app.listen(port,()=>{
    console.log(`Connected to the ${port}`);
})