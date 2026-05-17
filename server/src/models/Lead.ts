import mongoose, { Schema, type Document, type Model } from "mongoose";

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";
export type LeadSource = "Website" | "Instagram" | "Referral";

export interface ILead extends Document {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Lost"],
      default: "New"
    },
    source: {
      type: String,
      enum: ["Website", "Instagram", "Referral"],
      required: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

leadSchema.index({ name: "text", email: "text" });
leadSchema.index({ status: 1, source: 1, createdAt: -1 });

export const Lead: Model<ILead> = mongoose.model<ILead>("Lead", leadSchema);
