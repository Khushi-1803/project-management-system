import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import crypto from "crypto"

const userSchema = new Schema({
    avatar:{
        type:{
            url:String,
            localPath:String
        },
        default:{
            url:`https://placehold.co/600x400`,
            localPath:""
        }
    },
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    fullname:{
        type:String,
        trim:true
    },
    password:{
        type:String,
        required:[true, "Password is required"]
    },
    isemailverified:{
        type:Boolean,
        default:false
    },
    refreshtoken:{
        type:String
    },
    forgotpasswordtoken:{
        type:String
    },
    forgotpasswordexpiry:{
        type:Date
    },
    emailverificationtoken:{
        type:String
    },
    emailverificationexpiry:{
        type:Date
    },
    
},
{
    timestamps:true,
}
)
//HASHING PASSWORD
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


//CHECKING PASSWORD
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

//GENERATING ACCESS TOKEN
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign ({
        _id: this.id,
        email: this.email,
        username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
)
}

//GENERATING REFRESH TOKEN
userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign ({
        _id: this.id,
        email: this.email,
        username: this.username
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
)
}

//TEMPERORY TOKEN: VERIFY USER,REFRESH PASSWORD
userSchema.methods.generateTemperoryToken = async function(){
    const unHashedToken = crypto.randomBytes(20).toString("hex")
    const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex")

    const tokenExpiry = new Date(Date.now()+(20*60*1000))
    return {unHashedToken, hashedToken, tokenExpiry}
}

export const User = mongoose.model("User",userSchema)