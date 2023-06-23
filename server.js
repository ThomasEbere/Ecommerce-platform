//Set up  express server by installing express {npm install express}
//Set up nodemon by installing nodemon server

const express = require ('express');
const app = express();
const mongoose=require('mongoose');
const User=require('./models/user');
const sessions=require('express-session');
const generated_id=require('./random');
const { rawListeners } = require('./models/user');
const email= require('./emails.js');
const bodyParser=require('body-parser');
const Item=require('./models/items');
const fs = require('fs');
const path = require('path');
const cookieParser=require("cookie-parser");
require ('dotenv').config();
const connectRedis = require('connect-redis').default;
const redis = require('redis');
const Publishable_key ='pk_test_51NLSnIJWNtx0XCE5Xiq7sVf90tZR2kwCIx9XyKr34HVqnwR2Fd2Vg9wm55kJrBo8oIzSgphlirbVu7hsL4YH4AD400keQn4Fsk';
const Secret_Key='sk_test_51NLSnIJWNtx0XCE5kddIYxx0w9BZrsUmMxUHow7yHjSBVLEBlO8SDh3Vb066FAAsXJ8KkEGrRmQ36VrXm4zUwxb100no8mxnN6';

const stripe = require('stripe')(Secret_Key);

let session;

const redisClient = redis.createClient();
redisClient.connect().catch(console.error);

let redisStore= new connectRedis({
    client:redisClient,
    prefix:"muyapp:",
})

const oneDay=1000 * 60 *60 *24;

//Connection to Mongodb
const dbURI="mongodb+srv://thomasebere119:Prick123@cluster1.ju2mdph.mongodb.net/e-commerce?retryWrites=true&w=majority";

mongoose.connect(dbURI)
    .then((result)=> app.listen(4100))
    .catch((err)=> console.log(err));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));
// app.use(express.urlencoded({ extended:true}));
app.use(sessions({secret: 'Your_Secret_Key', store:redisStore,
    resave:false,saveUninitialized:false,
    cookie:{secure:false,httpOnly:false,
        maxAge:oneDay}}));
app.use(cookieParser());

app.use(bodyParser.json());
app.use(express.static((__dirname)));
app.use(bodyParser.urlencoded({extended:false}));

const multer = require('multer');
const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null,path.join(__dirname, '/uploads/'));
    },
    filename:(req, file, cb)=>{
        cb(null, file.fieldname + '-' + Date.now());
    }
});

const upload=multer({storage:storage});

app.get('/add-user', (req,res)=>{

    const user =new User({
        first_name:"Thomas",
        last_name:"Ebere",
        email:"thomasebere119@gmail.com",
        password:"Prick123$",
        usergenerated_id:'23487950'
    })
    user.save()
        .then((result)=>{
            res.send(result)
        })
        .catch((err)=>{
            console.log(err);
        });
})

app.post("/create-user", (req, res)=>{

    console.log(req.body);
    const user=new User(req.body);
    user.usergenerated_id=generated_id;
    user.password=user.generateHash(req.body.password);
    email.emailer(user.email, 1,generated_id);
    user.save()
    .then((result)=>{
        res.redirect('/confirm')
    })
    .catch((err)=>{
        console.log(err);
    })
})

app.post("/login", (req, res)=>{

    const user= req.body.email;
    const password=req.body.password;
    User.findOne({email:user}).then(data=>{
        console.log(data.email);
        if (data.validPassword(password)) {
            let email=data.email;
            session=req.session;
            session.email=email;
          res.redirect("/homepage");
        } else {
            let error= "Bad password. Please try again";
          res.render('login', {error});
        }
      });
});

app.get('/explore', (req, res)=>{
            Item.find().then((result)=>{
                res.render('explore', {title:'explore',result }); 
            }).catch((err)=>{
                console.log(err);
            })
        });


app.get('/homepage', (req, res)=>{
    session=req.session;
    if (session.email){
        let myFirstName='';
        let email=req.session.email;
        User.findOne({email:email}).then(data =>{
            // console.log(data.first_name);
            myFirstName=data.first_name;
            Item.find().then((result)=>{
                res.render('homepage', {title:'homepage', myFirstName,result }); 
            }).catch((err)=>{
                console.log(err);
            })
        })
    }
});

app.get('/confirm',(req, res)=>{
    res.render('confirmemail');
})

app.get('/confirmaccount/:email/:id', (req, res)=>{
    const email= req.params.email;
    const id = req.params.id;
    User.findOne({email:email}).then(data=>{
        if(data.usergenerated_id==id){
            User.updateOne({email:email}, {"$set":{"activated":true}}).then (e=>{
                console.log("Got here to activate");
                res.redirect('/');
            }).catch(s=>{
                console.log("Incorrect sign up");
            })
            
        }
    })
})

app.get('/', (req, res)=>{
    session=req.session;
    if (session.email){
        res.redirect('/homepage');
    }
    else{
        res.render('login');
    }
    
});

app.get('/regularlogin', (req, res)=>{
    session=req.session;
    if (session.email){
        res.redirect('/explore');
    }
    else{
        res.render('login');
    }
    
});

app.get('/create-items', (req, res)=>{
    res.render("create-items", {title:"create-items"});
})

app.post('/create-items', upload.single('image'), (req, res,next)=>{
    // console.log(req.body);
        console.log(req.file.filename);
    session=req.session;
    let useremail=session.email
    let item= new Item(req.body);
    item.created_by=useremail;
    console.log(req.body.image);
    item.image={
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        contentType:'image/png'
}
    item.save().then((result)=>{
        res.render('options', {title:'reviewpage'});
    }).catch((err)=>{
        console.log(err);
    })
})

app.get('/signup', (req, res)=>{
    res.render('signup');
});

app.get('/myroute', (req, res)=>{
    res.send("New Page");
});

app.get("/logout", (req, res)=>{
    req.session.destroy();
    res.redirect('/');
});

app.get('/purchase/:item_Name/:price', (req, res)=>{
    const itemname=req.params.item_Name;
    const price=req.params.price;
    const newprice = price*100;
    res.render('payment',{itemname, newprice, key:Publishable_key});
})

app.post('/payment/:price', (req, res)=>{
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Gourav Hammad',
        address: {
            line1: 'TC 9/4 Old MES colony',
            postal_code: '452331',
            city: 'Indore',
            state: 'Madhya Pradesh',
            country: 'India',
        }
    })
    .then((customer) => {
 
        return stripe.charges.create({
            amount: req.params.price,     // Charging Rs 25
            description: 'Web Development Product',
            currency: 'USD',
            customer: customer.id
        });
    })
    .then((charge) => {
        res.send("Success")  // If no error occurs
    })
    .catch((err) => {
        res.send(err)       // If some error occurs
    });
})