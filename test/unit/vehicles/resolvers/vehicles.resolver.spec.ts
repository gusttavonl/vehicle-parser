import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesResolver } from '../../../../src/modules/vehicles/graphql/vehicles/vehicles.resolver';
import { VehiclesService } from '../../../../src/modules/vehicles/services/vehicles.service';

describe('VehiclesResolver', () => {
  let resolver: VehiclesResolver;
  let service: VehiclesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesResolver,
        {
          provide: VehiclesService,
          useValue: {
            getAllMakes: jest.fn(),
            getMakeById: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<VehiclesResolver>(VehiclesResolver);
    service = module.get<VehiclesService>(VehiclesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should get all makes', async () => {
    const mockVehicles = [
      { makeId: '1', makeName: 'Toyota', vehicleTypes: [] },
    ];
    jest.spyOn(service, 'getAllMakes').mockResolvedValueOnce(mockVehicles);

    const result = await resolver.getAllMakes();
    expect(result).toEqual(mockVehicles);
  });

  it('should get make by id', async () => {
    const mockVehicle = { makeId: '1', makeName: 'Toyota', vehicleTypes: [] };
    jest.spyOn(service, 'getMakeById').mockResolvedValueOnce(mockVehicle);

    const result = await resolver.getMake('1');
    expect(result).toEqual(mockVehicle);
  });
});
