import { Test, TestingModule } from '@nestjs/testing';
import { VehicleRepository } from '../../../../src/modules/vehicles/repositories/vehicle.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VehicleDTO } from '../../../../src/modules/vehicles/dto/vehicle.dto';
import { Vehicle } from '../../../../src/modules/vehicles/entities/vehicle.entity';

describe('VehicleRepository', () => {
  let repository: VehicleRepository;
  let model: Model<Vehicle>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleRepository,
        {
          provide: getModelToken('Vehicle'),
          useValue: {
            insertMany: jest.fn(),
            findOne: jest.fn().mockReturnValue({
              exec: jest.fn(),
            }),
            find: jest.fn().mockReturnValue({
              exec: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    repository = module.get<VehicleRepository>(VehicleRepository);
    model = module.get<Model<Vehicle>>(getModelToken('Vehicle'));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should save multiple vehicles', async () => {
    const vehicles: VehicleDTO[] = [
      { makeId: '1', makeName: 'Toyota', vehicleTypes: [] },
      { makeId: '2', makeName: 'Ford', vehicleTypes: [] },
    ];

    await repository.saveMany(vehicles);
    expect(model.insertMany).toHaveBeenCalledWith(vehicles);
  });

  it('should find vehicle by makeId', async () => {
    const mockVehicle = { makeId: '1', makeName: 'Toyota', vehicleTypes: [] };
    (model.findOne().exec as jest.Mock).mockResolvedValueOnce(mockVehicle);

    const result = await repository.findByMakeId('1');
    expect(result).toEqual(mockVehicle);
    expect(model.findOne).toHaveBeenCalledWith({ makeId: '1' });
  });

  it('should find all vehicles', async () => {
    const mockVehicles = [
      { makeId: '1', makeName: 'Toyota', vehicleTypes: [] },
      { makeId: '2', makeName: 'Ford', vehicleTypes: [] },
    ];
    (model.find().exec as jest.Mock).mockResolvedValueOnce(mockVehicles);

    const result = await repository.findAll();
    expect(result).toEqual(mockVehicles);
    expect(model.find).toHaveBeenCalled();
  });
});
