import Mailgen from "mailgen"
import nodemailer from "nodemailer"

const sendEmail = async(options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Project_Managemet_System",
            link: "https://taskmanagelink.com"
        }
    })

   const emailTextual =   mailGenerator.generatePlaintext(options.mailgenContent)
   const emailHTML =   mailGenerator.generate(options.mailgenContent)

   const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,

        }
   })

   const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHTML
   }

   try {
    await transporter.sendMail(mail)
    
   } catch (error) {
    console.log("Email service failed silently. Make sure that you have provided your MAILTRAP crenditial in .env file");
    console.log("Error", error);
    
   }
    
}

const emailVerificationMailgenContent = (username,verificationUrl)=>{
    return{
        body:{
            name:username,
            intro:"Welcome to our App!",
            action:{
                instructions:"To verify the email please clickon following button",
                button:{
                    color:"#1aae5aff",
                    text:"Verify your email",
                    link:verificationUrl
                }
                
            },
            outro:"Need help, or have questions? Just reply to this email, we'd love to help"
        }
    }
}

const forgotPasswordMailgenContent = (username,passwordResetUrl)=>{
    return{
        body:{
            name:username,
            intro:"We got a request to set the password of your account",
            action:{
                instructions:"To reset the password please click on following button",
                button:{
                    color:"rgb(118, 101, 206)",
                    text:"Reset password",
                    link:passwordResetUrl
                }
                
            },
            outro:"Need help, or have questions? Just reply to this email, we'd love to help"
        }
    }
}
export{
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
};