import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({ timestamps: true, versionKey: false })
export class Trip {
  @Prop({ type: String, default: () => randomUUID() })
  _id: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  destinasiPerjalanan: string;

  @Prop({ required: true })
  tanggalMulaiPerjalanan: Date;

  @Prop({ required: true })
  tanggalBerakhirPerjalanan: Date;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, maxlength: 2000 })
  description: string;

  @Prop({ required: true, index: true })
  idUser: string;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
