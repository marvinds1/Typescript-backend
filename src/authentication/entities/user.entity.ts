import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ autoincrement: true, unique: true })
  _id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ unique: true, required: true })
  email: string;
  @Prop({ minlength: 6, required: true })
  password?: string;
  @Prop({ default: true })
  isActive: boolean;
  @Prop({ default: false })
  isAdmin: boolean;
  @Prop({ required: true, default: Date.now })
  createdAt: string;
  @Prop({ required: true, default: Date.now })
  updatedAt: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
