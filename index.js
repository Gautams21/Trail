const express = require("express");
const bcrypt=require('bcrypt');
const app= express();
const ejs=require("ejs");
const path=require("path");
const Schema=require("./models/Schema");
const Database=require("./database/Database");
const port=3001;
const nodemailer=require('nodemailer');
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

app.get('/forgot-password',(req,res)=>{
    res.render("forgot");
})

app.get('/reset-password/:token',(req,res)=>{
    const token=req.params.token;

    res.render('reset',{token});
})

app.post('/reset-password/:token', async (req, res) => {
    try {
        const token = req.params.token;
        console.log(token);
        const { password, confirm_password } = req.body;

        // Validate password and confirm_password
        if (!password || !confirm_password || password !== confirm_password) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Retrieve the user based on the reset token
        const user = await Schema.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        // Check if the user exists
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Update the user's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.send({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/forgot-password', async (req, res) => {
    const email = req.body.email;

    try {
        const user = await Schema.findOne({ email: email });

        if (!user) {
            return res.render("forgot", { message: "User not found with this email." });
        }

        // Use the user's ObjectID as the token
        const token = user._id.toString();

        // Save the token in the user document
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // Send the password reset email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'gs2788126@gmail.com',
                pass: 'jjck baxm zcpd pbgy'
            }
        });

        const mailOptions = {
            to: email,
            subject: 'Password Reset Request',
            text: `Click the following link to reset your password: http://localhost:3001/reset-password/${token}`,
            html: `<p>Click the following link to reset your password:</p><p><a href="http://localhost:3001/reset-password/${token}">http://localhost:3001/reset-password/${token}</a></p>`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                res.send('Error sending email');
            } else {
                console.log(info);
                res.send('Password reset email sent');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

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
    console.log(`Server running on http://localhost:${port}`);
})


// Verify the validity of the token
        // const user = await Schema.findOne({
        //     resetPasswordToken: token,
        //     resetPasswordExpires: { $gt: Date.now() }
        // });
        // console.log(user);

        // if (!user) {
        //     return res.status(400).json({ error: 'Invalid or expired reset token' });
        // }

        // Update the user's password