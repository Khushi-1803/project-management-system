import {User} from "../models/users.model.js"
import {ProjectMember} from "../models/projectmember.model.js"
import {ApiError } from "../utils/api-errors.js"
import {asyncHandler } from "../utils/async-handler.js"
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")

    if (!token) {
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select(
             "-password -refreshtoken -emailverificationtoken -emailverificationexpiry",
        );
        if (!user) {
          throw new ApiError(401,"Invalid access token")  
        }
        req.user = user;
        next();
    } catch (error) {
        
    }
})

export const verifyProjectPermission = (roles = []) => {
    asyncHandler(async(req,res,next)=>{
        const {projectId} = req.params
        if (!projectId) {
            throw new ApiError(400, "Project id is missing")
        }

        const project = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id),
        })
        if (!project) {
            throw new ApiError(400, "Project not found")
        }
        const givenRole = project?.role

        req.user.role = givenRole
        if (!roles.includes(givenRole)) {
          throw new ApiError(403,"You don't have permission to do this action")  
        }
        next()
    })

}