const express=require("express");
const mongoose = require('mongoose');
const bodyparser=require("body-parser");
const bcrypt=require("bcrypt");
const jwt=require('jsonwebtoken');
const { ResumeToken } = require("mongodb");

const app=express();
app.use(bodyparser.json());

const uSchema=mongoose.Schema(
    {name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }

    }
)
const User=mongoose.model('User',uSchema);

const generatetoken= (id) => {
return jwt.sign(
  {id},
  '23456dsecrett' , {expiresIn: '30m'}
)
};

const Auth=(req,res,next)=>{
if(req.headers.authorization && req.headers.authorization.startsWith('Bearer') )
{
const token=req.headers.authorization.split(' ')[1];
jwt.verify(
  token,
  '23456dsecrett',
  (err,de)=>
  {
    if(err)
    {
      res.json({ message: "Failed, try again"});
    }else{
      req.id=de.id;
    
      next();
    }
  }
);
}
else{
  res.json({ message: "Nothing, sorry"});
}
};

app.post('/register',async (req,res)=>{
   console.log("here")
    let newUser= new User({
        name:req.body.name,
        email:req.body.email,
        password:bcrypt.hashSync(req.body.password,9),

    });
    newUser = await newUser.save();

  if (newUser) {
    return res.json({ 
      header: {
          success: "0",
          message: "SignUp Success"
          
      },
      body: {
          signup: {
              name: req.body.name,          
             
          }
      }
  });
  } else {
    return res.json({ header: { 
      error: 1, 
      message: "Fail, try again" 
      } } );
  }
});

app.get('/',(req,res)=>{
    res.send("connection success!") ;
});
mongoose.connect("mongodb://localhost:27017/?readPreference=primary&appname=mongodb-vscode%200.5.0&ssl=false",
    {
 useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  dbName:"app-db"
    },(rer)=>{
        if(!rer){
        console.log("Successful connection") ;
    }
    else
    {
        console.log("error") ;
    }
});

app.post('/login', async(req,res) =>{

  const user = await User.findOne({email:req.body.email});

  if(user){
   if(bcrypt.compareSync(req.body.password, user.password)){ return res.json({
      header:{
        error:0,
        message: "Success"
      },
      body:{
        user,
       token:generatetoken(user._id)    
      }
    })}else{
      res.json({
        header:{
          error:0,
          message: "Incorrect Credentials"
        },
      })
    }
  } else{
    res.json({
      header:{
        error:0,
        message: "User not retrieved"
      },
    })
  }
})

app.get('/profile',Auth,async(req,res)=>
{ 
  const id=req.id;
  let user=await User.findOne({_id:id})
if(user)
{
  res.json({header: { 
    error: 0, 
    message: "Logged In" 
    
    }, 
    body: { 
    data: { 
      user_id: user._id,
      name: user.name,

                                                                                                     
    }
    } 
    });

}else {
  res.json({message:"User not found"});
}

});

app.listen(4000,()=>{
    console.log("Server is running ")
});