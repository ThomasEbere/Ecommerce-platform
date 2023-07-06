const nodemailer=require('nodemailer');
const genepass=require('./random.js');

module.exports.emailer=(sender, options, generatedValue)=>{
    let transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'thomasebere119@gmail.com',
            pass:'puzeghjhksczmubz'
        }
    });
    
    let mailoptions={
        from:"thomasebere119@gmail.com",
        to:sender,
        subject:"Sending emails using node.js",
        html:`Here is the email sent to you <a href=\"http://localhost:3000/confirmaccount/${sender}/${genepass}\">Welcome to the Party</a>`
    };

    let mailoption3={
        from:"thomasebere119@gmail.com",
        to:sender,
        subject:"Sending emails using node.js",
        html:`Here is the email sent to you <a href=\"http://localhost:4100/confirmaccount/admin/${sender}/${genepass}\">Welcome to the Party</a>`
    };
    
    let mailoptions2={
        from:"thomasebere119@gmail.com",
        to:sender,
        subject:"Sending emails using node.js",
        text:`Second email text + " " + ${generatedValue}`
    };

    if(options==1)
    {
        transporter.sendMail(mailoptions, (error, info)=>{
            if(error){
                console.log(error);
            }else{
                console.log("Email sent: " + info.response);
            }
        })
    }
    else if(options==2){
        transporter.sendMail(mailoptions2, (error, info)=>{
            if(error){
                console.log(error);
            }else{
                console.log("Email sent: " + info.response);
            }
        })
    }

    else if (options ==3){
        transporter.sendMail(mailoption3, (error, info)=>{
            if(error){
                console.log(error);
            }else{
                console.log("Email sent: " + info.response);
            }
        })
    }
    
}