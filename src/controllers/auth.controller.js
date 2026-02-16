import { User } from "../models/users.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-errors.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken"
import crypto from "crypto"

const generateAccessAndRefreshTokens = (async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshtoken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token",
    );
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists", []);
  }
  const user = await User.create({
    email,
    password,
    username,
    isemailverified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    await user.generateTemperoryToken();

  console.log("Before assigning:", user.emailverificationtoken);

  user.emailverificationtoken = hashedToken;
  user.emailverificationexpiry = tokenExpiry;

  console.log("After assigning:", user.emailverificationtoken);
  console.log("After assigning expiry:", user.emailverificationexpiry);

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken -emailverificationtoken -emailverificationexpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "user registered sucessfully and verification email has been sent on your email",
      ),
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User does not exists");
  }

  const isPsswordValid = await user.isPasswordCorrect(password);
  if (!isPsswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshtoken -emailverificationtoken -emailverificationexpiry",
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in sucessfully",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findOneAndUpdate(
  { _id: req.user._id },
   { $set:{
    refreshtoken: ""
   }
  },
  {
    new: true
  }
  );
  const options = {
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,{},"User logged out")
  )
});

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      req.user,
      "Current user fetched successfully"
    )
  )

})

const verifyEmail = asyncHandler(async(req,res)=>{
  const {verificationToken} = req.params
  if (!verificationToken) {
    throw new ApiError(400,"Email verificaton token is missing")
  }
  let hashedToken = crypto
  .createHash("sha256")
  .update(verificationToken)
  .digest("hex")

  const user = await User.findOne({
    emailverificationtoken: hashedToken,
    emailverificationexpiry: {$gt:Date.now()}

  })
  if (!user) {
    throw new ApiError(400,"Token is invalid or expired")
  }
  user.emailverificationtoken = undefined;
  user.emailverificationexpiry = undefined;
  user.isemailverified = true;
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {isemailverified:true},
      "Email is verified"
    )
  )
})

const resendEmailVerification = asyncHandler(async(req,res)=>{
  const user = await User.findById(req.user?._id)
  if (!user) {
    throw new ApiError(404,"User does not exist")
  }
  if (user.isemailverified) {
    throw new ApiError(409,"Email is already verified")
  }
  const { unHashedToken, hashedToken, tokenExpiry } =
    await user.generateTemperoryToken();

  console.log("Before assigning:", user.emailverificationtoken);

  user.emailverificationtoken = hashedToken;
  user.emailverificationexpiry = tokenExpiry;

  console.log("After assigning:", user.emailverificationtoken);
  console.log("After assigning expiry:", user.emailverificationexpiry);

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "mail has been sent to your email"
    )
  )

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new ApiError(401,"unauthiorized access")
  }
  try {
    const decodedRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedRefreshToken?._id)
    if (!user) {
      throw new ApiError(401,"Invalid refresh token")
    }
    if (incomingRefreshToken !== user?.refreshtoken) {
       throw new ApiError(401," Refresh token is expired")
    }
    const options = {
      httpOnly:true,
      secure:true
    }
    const { accessToken, refreshToken: newRefreshToken } =
  await generateAccessAndRefreshTokens(user._id);

user.refreshtoken = newRefreshToken;
await user.save({ validateBeforeSave: false });

return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", newRefreshToken, options)
  .json(
    new ApiResponse(
      200,
      { accessToken, refreshToken: newRefreshToken },
      "Access token refreshed"
    )
  );


  } catch (error) {
     throw new ApiError(401," Invalid refresh token")
  }
})

const forgotPasswordRequest = asyncHandler(async(req,res)=>{
  const {email} = req.body;
  const user = await User.findOne({email})
  if(!user){
    throw new ApiError(404,"User does not exist")
  }
  const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemperoryToken();

  user.forgotpasswordtoken = hashedToken;
  user.forgotpasswordexpiry = tokenExpiry;

  await user.save({validateBeforeSave:false})

  await sendEmail(
    {
    email: user?.email,
    subject: "Password reset request",
    mailgenContent: forgotPasswordMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  }
  )
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "Password reest mail has been sent on your email"
    )
  )
})

const resetForgotPassword = asyncHandler(async(req,res)=>{
  const{resetToken} = req.params;
  const {newPassword} = req.body;
  let hashedToken = crypto
  .create("sha256")
  .update(resetToken)
  .digest("hex")

  const user = await User.findOne({
    forgotpasswordtoken: hashedToken,
    forgotpasswordexpiry: {$gt:Date.now()},
  })
  if(!user){
    throw new ApiError(409," Token is invalid or expired")
  }
  user.forgotpasswordexpiry = undefined
  user.forgotpasswordtoken = undefined

  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "Password reset sucessfully"
    )
  )
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{

  const{oldPassword,newPassword} = req.body
  const user = await User.findById(req.user_id)
  const isPasswordValid = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordValid) {
    throw new ApiError(400," Invalid old password")
  }
  user.password = newPassword
  await user.save({validateBeforeSave:false})
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "Password changed sucessfully"
    )
  )
})

export { registerUser, login, logout, getCurrentUser, verifyEmail, resendEmailVerification, refreshAccessToken, forgotPasswordRequest,resetForgotPassword, changeCurrentPassword };
