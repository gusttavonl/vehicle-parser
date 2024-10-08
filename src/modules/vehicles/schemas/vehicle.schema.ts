import { Schema } from 'mongoose';

export const VehicleTypeSchema = new Schema({
  typeId: String,
  typeName: String,
});

export const VehicleSchema = new Schema({
  makeId: String,
  makeName: String,
  vehicleTypes: [VehicleTypeSchema],
});
