import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


console.log("Loaded app.js from:", import.meta.url);
const app = express();
const port = process.env.PORT || 3000;

//BASIC CONFIGURATIONS
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser());

//CORS CONFIGURATIONS
app.use(cors({
    origin:process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders:["Authorization","Content-Type"]
}))

//IMPORTING ROUTES
import healthCheck from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.route.js"

app.use("/api/v1/healthcheck",healthCheck)
app.use("/api/v1/auth",authRouter)    //“All auth-related routes live under /api/v1/auth.”


app.get("/",(req,res)=>{
    res.send("Hello world!")
})

export default app;