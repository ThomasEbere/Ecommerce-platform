//Set up  express server by installing express {npm install express}
//Set up nodemon by installing nodemon server

const express = require ('express');
const app = express();
const mongoose=require('mongoose');
const User=require('./models/user');
const Admin = require('./models/admin');
const sessions=require('express-session');
const generated_id=require('./random');
const { rawListeners } = require('./models/user');
const email= require('./emails.js');
const bodyParser=require('body-parser');
const Item=require('./models/items');
const Cart=require('./models/cart');
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

app.get("/signupadmin", (req, res)=>{

    res.render('adminsignup');
})

app.get("/usersignup", (req, res)=>{
    res.render('usersignup');
})

app.get('/cart/:id', (req, res)=>{
    const id = req.params.id;
    console.log(id);
    session=req.session;
    if(session.email){
        let email=req.session.email;
        Cart.findById({_id:id}).then(data=>{
            if(data && data.added_by==email){
                console.log(data.quantity);
                let newQuantity=parseInt(data.quantity)+1;
                console.log(newQuantity);
                myquantity=newQuantity.toString();
                console.log(myquantity);
                Cart.updateOne({_id:id},{"$set":{"quantity":myquantity}}).then(res.redirect("/cart"))
            }else{
                Item.findById({_id:id}).then(data=>{
                    data._id=null;
                    const cart=new Cart(data);   
                    cart.added_by=email;
                    cart.quantity=1;
                    cart.isNew=true;
                    cart.item_id=id;
                    cart.save().then(result=>{
                        console.log("Item Successfully added to cart");
                        res.redirect('/');
                    }).catch((err)=>{
                        console.log(err);
                    })
                }).catch(err=>{
                    console.log(err)
                })
            }
        }) 
    }
    else{
        res.redirect('/regularlogin');
    }
})

app.get("/cart", (req, res)=>{
    let email=req.session.email;
    Cart.find({added_by:email}).then(data=>{
        let title="cart";
        console.log(data.length)
        res.render('cart', {data, title});
    }).catch((err)=>{
        console.log("no items created");
    })
})

app.get('/add-item/:id', (req, res)=>{
    let id=req.params.id
    console.log(id);
    Cart.findById({_id:id}).then(data=>{
        console.log(data.quantity);
        let newQuantity=parseInt(data.quantity)+1;
        console.log(newQuantity);
        myquantity=newQuantity.toString();
        console.log(myquantity);
        Cart.updateOne({_id:id},{"$set":{"quantity":myquantity}}).then(res.redirect("/cart"))
    })
})

app.get('/sub-item/:id', (req, res)=>{
    let id=req.params.id
    console.log(id);
    Cart.findById({_id:id}).then(data=>{
        console.log(data.quantity);
        let newQuantity=parseInt(data.quantity)-1;
        console.log(newQuantity);
        myquantity=newQuantity.toString();
        console.log(myquantity);
        Cart.updateOne({_id:id},{"$set":{"quantity":myquantity}}).then(res.redirect("/cart"))
    })
})

app.post("/create-admin-user", (req, res)=>{
    const admin = new Admin(req.body);
    admin.role="admin";
    admin.admingenerated_id=generated_id;
    admin.password=admin.generateHash(req.body.password);
    console.log(admin.admingenerated_id);
    email.emailer(admin.email, 3,generated_id);
    admin.save()
    .then((result)=>{
        res.redirect('/confirm')
    })
    .catch((err)=>{
        console.log(err);
    })
})

app.get("/adminhomepage", (req, res)=>{
    res.render("adminhomepage");
})


app.get("/adminlogin", (req, res)=>{
    res.render("adminlogin");
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

app.post("/adminlogin", (req, res)=>{
    const user= req.body.email;
    const password=req.body.password;
    console.log("This is the value of " + user);
    Admin.findOne({email:user}).then(data=>{
        console.log(data);
        console.log(data.email);
        const firstName=data.first_name;
        if (data.validPassword(password)) {
            let email=data.email;
            session=req.session;
            session.email=email;
          res.redirect("/adminhomepage");
        } else {
            let error1= "Bad password. Please try again";
          res.render('adminlogin', {error1});
        }
      }).catch((err)=>{
            let error2="User does not exit";
        res.render('adminlogin', {error2});
        console.log("User does not exist");
      })
});

app.get('/explore', (req, res)=>{
            Item.find().then((result)=>{
                console.log(result.item_Name);
                res.render('homepage', {title:'explore',result }); 
            }).catch((err)=>{
                console.log(err);
            })
        });

app.get('/item-inventory', (req, res)=>{
    let email=req.session.email;
    Item.find({created_by:email}).then(data=>{
        res.render('itemspage', {data});
    }).catch((err)=>{
        console.log("no items created");
    })
})

app.get('/updateitem/:id', (req,res)=>{
    const id=req.params.id;
    console.log(id);
    Item.findOne({_id:id}).then(data=>{
        res.render('updateitems', {data})
    })
    
})

app.post('/update/:id',upload.single('image'), (req, res)=>{
    let email=req.session.email;
    const newid=req.params.id;
    const items=new Item(req.body);
    items._id=newid;
    items.image={
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        contentType:'image/png'
        }
    items.created_by=email;
    Item.updateOne({_id:newid}, {"$set":{"item_Name":items.item_Name, "quantity":items.quantity, "price":items.price,"Description":items.Description,"image":items.image,"updatedAt":items.updatedAt}}).then(data=>{
        res.redirect('/item-inventory');
    }).catch((err)=>{
        console.log(err);
    })
})

app.get("/delete/:id", (req, res)=>{
    const id = req.params.id;
    Item.findByIdAndDelete(id).then(result=>{
        res.redirect("/item-inventory");
    }).catch(err=>{
        console.log("No items to delete");
    })
})

app.get('/homepage', (req, res)=>{
    session=req.session;
    if (session.email){
        let myFirstName='';
        let email=req.session.email;
        User.findOne({email:email}).then(data =>{
            // console.log(data.first_name);
            myFirstName=data.first_name;
            Item.find().then((result)=>{
                res.render('landingpage', {title:'homepage', myFirstName,result }); 
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

app.get('/confirmaccount/admin/:email/:id', (req, res)=>{
    const email= req.params.email;
    const id = req.params.id;
    console.log(email, id);
    Admin.findOne({email:email}).then(data=>{
        if(data.admingenerated_id==id){
            Admin.updateOne({email:email}, {"$set":{"activated":true}}).then (e=>{
                console.log("Got here to activate");
                res.render('adminlogin');
            }).catch(s=>{
                console.log("Incorrect sign up");
            })   
        }
        else{
            console.log("Wrong ID. Please contact Admin");
        }
    })
})

app.get('/', (req, res)=>{
    session=req.session
    if(session.email){
        Item.find().then((result)=>{
            res.render('homepage', {title:'homepage',result }); 
        }).catch((err)=>{
            console.log(err);
        })
    }
    else{
        res.redirect('/regularlogin');
    }
    
})
   
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
    let quantity=1;
    const price=req.params.price;
    const newprice = price*100*quantity;
    res.render('payment',{itemname, newprice, key:Publishable_key});
})

app.get('/purchase/:item_Name/:price/:quantity', (req, res)=>{
    const itemname=req.params.item_Name;
    let quantity=req.params.quantity;
    const price=req.params.price;
    const newprice = price*100*quantity;
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