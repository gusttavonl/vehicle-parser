import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VehicleDTO } from '../dto/vehicle.dto';
import { Vehicle } from '../entities/vehicle.entity';

@Injectable()
export class VehicleRepository {
  private readonly logger = new Logger(VehicleRepository.name);

  constructor(
    @InjectModel('Vehicle') private readonly vehicleModel: Model<Vehicle>,
  ) {}

  async saveMany(vehicles: VehicleDTO[]): Promise<void> {
    this.logger.log(`Saving ${vehicles.length} vehicles to the database`);
    await this.vehicleModel.insertMany(vehicles);
    this.logger.log('Vehicles saved successfully');
  }

  async findByMakeId(makeId: string): Promise<Vehicle> {
    this.logger.log(`Searching for vehicle with makeId: ${makeId}`);
    const vehicle = await this.vehicleModel.findOne({ makeId }).exec();
    if (!vehicle) {
      this.logger.warn(`Vehicle with makeId ${makeId} not found`);
    } else {
      this.logger.log(`Vehicle with makeId ${makeId} found`);
    }
    return vehicle;
  }

  async findAll(): Promise<Vehicle[]> {
    this.logger.log('Fetching all vehicles from the database');
    const vehicles = await this.vehicleModel.find().exec();
    this.logger.log(`Fetched ${vehicles.length} vehicles from the database`);
    return vehicles;
  }

  async deleteAll(): Promise<void> {
    this.logger.log('Deleting all vehicles from the database');
    await this.vehicleModel.deleteMany({});
    this.logger.log('All vehicles deleted successfully');
  }

  async updateOrCreate(vehicle: VehicleDTO): Promise<void> {
    this.logger.log(
      `Updating or creating vehicle with makeId: ${vehicle.makeId}`,
    );
    await this.vehicleModel.updateOne(
      { makeId: vehicle.makeId },
      { $set: vehicle },
      { upsert: true },
    );
    this.logger.log(
      `Vehicle with makeId: ${vehicle.makeId} updated or created successfully`,
    );
  }
}
