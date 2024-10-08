import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { parseXmlToJson } from 'src/common/utils/xml-parser';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { VehicleDTO, VehicleTypeDTO } from '../dto/vehicle.dto';
import { mockVehicleTypes } from './mocks/mockVehicleTypes.mock';
import * as fs from 'fs';
import * as path from 'path';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount),
  retryCondition: (error) =>
    error.response.status === 429 || error.response.status === 403,
});

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async fetchAndSaveMakes(): Promise<void> {
    this.logger.log('Starting to fetch and save vehicle makes');
    try {
      const datasetPath = path.join('src/modules/datasets/makes.xml');
      const datasetXml = fs.readFileSync(datasetPath, 'utf8');
      this.logger.log('Dataset loaded from file');

      const parsedDataset = await parseXmlToJson(datasetXml);
      const makes = parsedDataset.Response.Results[0].AllVehicleMakes;

      this.logger.log(`Found ${makes.length} vehicle makes in the dataset`);

      await this.vehicleRepository.deleteAll();
      this.logger.log('Deleted existing records from the repository');

      const vehiclePromises = makes.map(async (make) => {
        const vehicleDTO: VehicleDTO = {
          makeId: make.Make_ID[0],
          makeName: make.Make_Name[0],
          vehicleTypes: [],
        };

        try {
          const vehicleTypes = await this.getVehicleTypesFromDataset(
            vehicleDTO.makeId,
          );
          vehicleDTO.vehicleTypes = vehicleTypes;
        } catch (error) {
          this.logger.error(
            `Error fetching vehicle types for make: ${make.Make_Name[0]}. Error: ${error.message}`,
          );
        }

        return vehicleDTO;
      });

      const allVehicles = await Promise.all(vehiclePromises);
      this.logger.log('Saving all vehicle makes and types to the repository');
      await this.vehicleRepository.saveMany(allVehicles);

      this.logger.log('Vehicle makes and types saved successfully');
      setImmediate(() => {
        this.logger.log(
          'Starting update all makes and types from API in the background',
        );
        this.updateAllMakesAndTypesFromAPI();
      });
    } catch (error) {
      this.logger.error(`Error in fetchAndSaveMakes: ${error.message}`);
    }
  }

  async getVehicleTypesFromDataset(makeId: string): Promise<VehicleTypeDTO[]> {
    this.logger.log(
      `Fetching vehicle types from dataset for makeId: ${makeId}`,
    );
    try {
      const datasetTypesPath = path.join('src/modules/datasets/types.xml');
      const datasetXml = fs.readFileSync(datasetTypesPath, 'utf8');
      const parsedDataset = await parseXmlToJson(datasetXml);
      const vehicleTypes =
        parsedDataset.Response.Results[0].VehicleTypesForMakeIds;

      this.logger.log(
        `Fetched ${vehicleTypes.length} vehicle types from dataset for makeId: ${makeId}`,
      );
      return vehicleTypes.map((vt) => ({
        typeId: vt.VehicleTypeId[0],
        typeName: vt.VehicleTypeName[0],
      }));
    } catch (error) {
      this.logger.error(
        `Error fetching vehicle types from dataset for makeId: ${makeId}. Error: ${error.message}`,
      );
      return mockVehicleTypes[makeId] || [];
    }
  }

  async updateAllMakesAndTypesFromAPI(): Promise<void> {
    this.logger.log('Starting to update vehicle makes and types from API');
    try {
      const response = await axios.get(process.env.GET_MAKES_URL);
      const parsedData = await parseXmlToJson(response.data);
      const makes = parsedData.Response.Results[0].AllVehicleMakes;

      const vehicles = await makes.map(async (make) => {
        this.logger.log(
          `Fetching vehicle types from API for make: ${make.Make_Name[0]} (${make.Make_ID[0]})`,
        );

        const vehicleDTO: VehicleDTO = {
          makeId: make.Make_ID[0],
          makeName: make.Make_Name[0],
          vehicleTypes: [],
        };

        try {
          const vehicleTypes = await this.fetchVehicleTypes(vehicleDTO.makeId);
          vehicleDTO.vehicleTypes = vehicleTypes;
        } catch (error) {
          this.logger.error(
            `Error fetching vehicle types from API for make: ${make.Make_Name[0]}. Error: ${error.message}`,
          );
        }

        return vehicleDTO;
      });

      await this.vehicleRepository.deleteAll();
      this.logger.log(
        'Deleted existing records from the repository (API Update)',
      );
      await this.vehicleRepository.saveMany(vehicles);

      this.logger.log('Vehicle makes and types updated successfully from API');
    } catch (error) {
      this.logger.error(`Error updating data from API: ${error.message}`);
    }
  }

  async fetchVehicleTypes(makeId: string): Promise<VehicleTypeDTO[]> {
    this.logger.log(`Fetching vehicle types from API for makeId: ${makeId}`);
    try {
      const response = await axios.get(
        `${process.env.GET_VEHICLE_TYPES_URL}/${makeId}?format=xml`,
      );

      const parsedData = await parseXmlToJson(response.data);
      if (parsedData.Response.Results[0] > 0) {
        const vehicleTypes =
          parsedData.Response.Results[0].VehicleTypesForMakeIds.map((vt) => ({
            typeId: vt.VehicleTypeId[0],
            typeName: vt.VehicleTypeName[0],
          }));
        this.logger.log(
          `Fetched ${vehicleTypes.length} vehicle types from API for makeId: ${makeId}`,
        );
        return vehicleTypes;
      }
    } catch (error) {
      this.logger.error(
        `Error fetching vehicle types for ${makeId}. Error: ${error.message}`,
      );
      return mockVehicleTypes[makeId] || [];
    }
  }

  async getAllMakes(): Promise<VehicleDTO[]> {
    this.logger.log('Fetching all vehicle makes from the repository');
    return this.vehicleRepository.findAll();
  }

  async getMakeById(makeId: string): Promise<VehicleDTO> {
    this.logger.log(`Fetching vehicle make with makeId: ${makeId}`);
    return this.vehicleRepository.findByMakeId(makeId);
  }
}
