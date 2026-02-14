import { User } from "../models/users.model.js";
import { Project } from "../models/projectmodel.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-errors.js";
import { asyncHandler } from "../utils/async-handler.js";

const getProject = asyncHandler(async(req,res)=>{
    //test
})
const getProjectById = asyncHandler(async(req,res)=>{
    //test
})
const createProject = asyncHandler(async(req,res)=>{
    //test
})
const deleteProject = asyncHandler(async(req,res)=>{
    //test
})
const addMembersToProject = asyncHandler(async(req,res)=>{
    //test
})
const getProjectMembers = asyncHandler(async(req,res)=>{
    //test
})
const updateMemberRole = asyncHandler(async(req,res)=>{
    //test
})
const deleteMember = asyncHandler(async(req,res)=>{
    //test
})

export {
    getProject,
    getProjectById,
    createProject,
    deleteProject,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember
}