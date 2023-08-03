// videoModel.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

interface IVideo extends Document {
  videoLink: string;
  time : string;
  date : string;
}

const videoSchema: Schema<IVideo> = new mongoose.Schema({
  videoLink: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

const Video: Model<IVideo> = mongoose.model('Video', videoSchema);

export default Video;
