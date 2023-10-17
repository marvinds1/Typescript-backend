import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Trip {
  @Prop({ autoincrement: true })
  _id: string;
  @Prop({ required: true })
  destinasiPerjalanan: string;
  @Prop({ required: true })
  tanggalMulaiPerjalanan: Date;
  @Prop({ required: true })
  tanggalBerakhirPerjalanan: Date;
  @Prop({ required: true })
  price: number;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true, default: Date.now })
  createdAt: Date;
  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
  @Prop({ required: true })
  idUser: string;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
