const nodemailer=require('nodemailer');
const genepass=require('./random.js');

module.exports.paymentemail=(sender,itemname)=>{
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
        subject:"Successful Item Purchase",
        html:`<p> Your purchase for ${itemname} was successful </p>`
    }
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