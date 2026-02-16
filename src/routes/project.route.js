import { Router } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMembersToProject,
  getProjectMembers,
  updateMemberRole,
  deleteMember,
} from "../controllers/project.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createProjectValidator,
  addMembersToProjectValidator,
} from "../validators/index.js";
import {
  verifyJWT,
  verifyProjectPermission,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRole, userRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT)
router
.route("/")
.get(getProjects)
.post(createProjectValidator(),validate,createProject)

router
.route("/:projectId")
.get(verifyProjectPermission(AvailableUserRole),getProjectById)
.put(verifyProjectPermission([userRolesEnum.ADMIN]),validate,updateProject)
.delete(verifyProjectPermission([userRolesEnum.ADMIN]),deleteProject)

router
.route("/:projectId/members")
.get(getProjectMembers)
.post(verifyProjectPermission([userRolesEnum.ADMIN]),addMembersToProjectValidator(),validate,addMembersToProject)

router
.route("/:projectId/members/:userId")
.put(verifyProjectPermission([userRolesEnum.ADMIN]),updateMemberRole)
.delete(verifyProjectPermission([userRolesEnum.ADMIN]),deleteMember)