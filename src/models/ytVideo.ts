// videoModel.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

interface IVideo extends Document {
  roomId: string;
  title: string;
  createdBy: string
  videoLink: string;
  dateAndTime: Date;
}

const videoSchema: Schema<IVideo> = new mongoose.Schema({
  roomId: {
    type: String,
    required: false,
  },
  createdBy: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
  videoLink: {
    type: String,
    required: false,
  },
  dateAndTime: {
    type: Date,
    required: false,
  },
});

const Video: Model<IVideo> = mongoose.model('Video', videoSchema);

export default Video;
