var mongoose = require("mongoose");
const leaveSchema = new mongoose.Schema(
  {
    subject: { type: String, required: "subject cant be blank" },
    from: Date,
    to: Date,
    days: Number,
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending"
    },
    hrstatus: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending"
    },
    finalstatus: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending"
    },
    approved: {
      type: Boolean,
      default: false
    },
    denied: {
      type: Boolean,
      default: false
    },
    employee: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
      },
      username: String
    },
      manager: {
          id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Manager"
          },
          username: String
      }
  },
  { timestamps: {} }
);
var Leave = (module.exports = mongoose.model("Leave", leaveSchema));


module.exports.getLeaveById = function(id, callback) {
    Leave.findById(id, callback);
    console.log("Leave ID DIsplay");
    console.log(id);
};
