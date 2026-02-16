import { User } from "../models/users.model.js";
import { Project } from "../models/projectmodel.js";
import { Task } from "../models/task.model.js";
import { Subtask } from "../models/subtask.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-errors.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { userRolesEnum, AvailableUserRole } from "../utils/constants.js";

const getTask = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId).populate(
      "assignedTo",
      "avatar username fullname",
    ),
  });
  return res
    .status(201)
    .json(new ApiResponse(201, tasks, "Task fetched sucessfully"));
});
const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const files = req.files || [];
  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.orignalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const task = await Task.create({
    title,
    description,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    status,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    attachments,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created sucessfully"));
});
const getTaskById = asyncHandler(async (req, res, next) => {
  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            _id: 1,
            username: 1,
            fullname: 1,
            avatar: 1,
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "-id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullname: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields:{
                createdBy:{
                    $arrayElemAt:["$createdBy",0]
                }
            }
          },
          {
            $addFields:{
                assignedTo:{
                    $arrayElemAt:["$assignedTo",0]
                }
            }
          }
        ],
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404,"Task not found")
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task[0], "Task fetched sucessfully"));
});

const updateTask = asyncHandler(async (req, res, next) => {
  //test
});
const deleteTask = asyncHandler(async (req, res, next) => {
  //test
});
const createSubTask = asyncHandler(async (req, res, next) => {
  //test
});
const updateSubTask = asyncHandler(async (req, res, next) => {
  //test
});
const deleteSubTask = asyncHandler(async (req, res, next) => {
  //test
});

export {
  getTask,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
};
