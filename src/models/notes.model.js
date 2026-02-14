import mongoose ,{Schema} from "mongoose";
const projectNoteSchema = new Schema({
    project:{
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    content:{
        type:String,
        required:true
    }
},{timestamps:true})

export const ProjectNotes = mongoose.model("projectNotes",projectNoteSchema)