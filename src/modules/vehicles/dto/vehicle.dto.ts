export class VehicleTypeDTO {
  typeId: string;
  typeName: string;
}

export class VehicleDTO {
  makeId: string;
  makeName: string;
  vehicleTypes: VehicleTypeDTO[];
}
