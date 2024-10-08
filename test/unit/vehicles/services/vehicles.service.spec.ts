import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from '../../../../src/modules/vehicles/services/vehicles.service';
import { VehicleRepository } from '../../../../src/modules/vehicles/repositories/vehicle.repository';
import axios from 'axios';
import { mockVehicleTypes } from '../../../../src/modules/vehicles/services/mocks/mockVehicleTypes.mock';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VehiclesService', () => {
  let service: VehiclesService;
  let repository: VehicleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: VehicleRepository,
          useValue: {
            saveMany: jest.fn(),
            findAll: jest.fn(),
            findByMakeId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    repository = module.get<VehicleRepository>(VehicleRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch and save vehicle makes', async () => {
    const mockMakesResponse = {
      data: '<Response><Results><AllVehicleMakes><Make_ID>1</Make_ID><Make_Name>Toyota</Make_Name></AllVehicleMakes></Results></Response>',
    };

    mockedAxios.get.mockResolvedValueOnce(mockMakesResponse);
    mockedAxios.get.mockResolvedValueOnce({
      data: '<Response><Results><VehicleTypesForMakeIds><VehicleTypeId>1</VehicleTypeId><VehicleTypeName>Car</VehicleTypeName></VehicleTypesForMakeIds></Results></Response>',
    });

    await service.fetchAndSaveMakes();

    expect(repository.saveMany).toHaveBeenCalledWith([
      {
        makeId: '1',
        makeName: 'Toyota',
        vehicleTypes: [{ typeId: '1', typeName: 'Car' }],
      },
    ]);
  });

  it('should use mock data when API fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API failure'));

    const result = await service.fetchVehicleTypes('12345');
    expect(result).toEqual(mockVehicleTypes['12345']);
  });

  it('should retrieve all vehicle makes from repository', async () => {
    const mockVehicles = [
      { makeId: '1', makeName: 'Toyota', vehicleTypes: [] },
    ];
    jest.spyOn(repository, 'findAll').mockResolvedValueOnce(mockVehicles);

    const result = await service.getAllMakes();
    expect(result).toEqual(mockVehicles);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('should retrieve vehicle by makeId from repository', async () => {
    const mockVehicle = { makeId: '1', makeName: 'Toyota', vehicleTypes: [] };
    jest.spyOn(repository, 'findByMakeId').mockResolvedValueOnce(mockVehicle);

    const result = await service.getMakeById('1');
    expect(result).toEqual(mockVehicle);
    expect(repository.findByMakeId).toHaveBeenCalledWith('1');
  });
});
