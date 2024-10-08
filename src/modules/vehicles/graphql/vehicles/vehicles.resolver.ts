import { Resolver, Query, Args } from '@nestjs/graphql';
import { Vehicle } from '../../entities/vehicle.entity';
import { VehiclesService } from '../../services/vehicles.service';
import { Logger, NotFoundException } from '@nestjs/common';

@Resolver(() => Vehicle)
export class VehiclesResolver {
  private readonly logger = new Logger(VehiclesResolver.name);

  constructor(private readonly vehiclesService: VehiclesService) {}

  @Query(() => [Vehicle])
  async getAllMakes(): Promise<Vehicle[]> {
    this.logger.log('Fetching all vehicle makes');
    const makes = await this.vehiclesService.getAllMakes();
    this.logger.log(`Fetched ${makes.length} vehicle makes`);
    return makes;
  }

  @Query(() => Vehicle)
  async getMake(@Args('makeId') makeId: string): Promise<Vehicle> {
    this.logger.log(`Fetching vehicle make with ID: ${makeId}`);
    const vehicle = await this.vehiclesService.getMakeById(makeId);

    if (!vehicle) {
      this.logger.warn(`Vehicle make with ID ${makeId} not found`);
      throw new NotFoundException(`Vehicle make with ID ${makeId} not found`);
    }

    this.logger.log(`Vehicle make with ID ${makeId} found`);
    return vehicle;
  }
}
