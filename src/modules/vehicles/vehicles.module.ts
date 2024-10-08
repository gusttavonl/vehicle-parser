import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleRepository } from './repositories/vehicle.repository';
import { VehiclesResolver } from './graphql/vehicles/vehicles.resolver';
import { VehiclesService } from './services/vehicles.service';
import { VehicleSchema } from './schemas/vehicle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Vehicle', schema: VehicleSchema }]),
  ],
  providers: [VehiclesService, VehiclesResolver, VehicleRepository],
})
export class VehiclesModule {}
