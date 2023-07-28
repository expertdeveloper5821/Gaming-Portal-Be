// types.d.ts
import { Document, Types } from 'mongoose';

interface Role {
  _id: Types.ObjectId;
  name: string;
}

interface User {
  _id: Types.ObjectId;
  username: string;
  password: string;
  roles: Role[];
}

type UserDocument = User & Document;
