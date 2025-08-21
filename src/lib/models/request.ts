import { Document, Model, model, models, Schema } from "mongoose";
import { RequestStatus } from "../types/request";

interface Request extends Document {
  requestorName: string;
  itemRequested: string;
  status: RequestStatus;
  createdDate: Date;
  lastEditedDate?: Date;
}

const requestSchema = new Schema<Request>(
  {
    requestorName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
    },
    itemRequested: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(RequestStatus) as string[],
      default: RequestStatus.PENDING,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "createdDate", updatedAt: "lastEditedDate" },
  }
);

const RequestModel: Model<Request> = (models.Request as Model<Request>) || model<Request>("Request", requestSchema);

export default RequestModel;
