import mongoose from 'mongoose';

const todoSchema = mongoose.Schema({
    text:{type: String},
    completed:{type: Boolean, default:false}
})

const taskSchema = mongoose.Schema({
  title: { type: String },
  description: { type: String },
  priority: { type: String, enum:["Low","Medium","High"], default:"Low"},
  status: {type: String,enum:["created","pending","In progress","complected"], default:"created"},
  dueDate:{type: Date},
  assignedTo:[{type: mongoose.Schema.Types.ObjectId, ref:"User"}],
  createdBy:{type: mongoose.Schema.Types.ObjectId, ref:"User"},
  attachments:[{type:String}],
  todoCheckList:[todoSchema],
  progress: { type: Number, default:0 },
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default Task;
