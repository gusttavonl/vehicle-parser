import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class VehicleType {
  @Field()
  typeId: string;

  @Field()
  typeName: string;
}

@ObjectType()
export class Vehicle {
  @Field()
  makeId: string;

  @Field()
  makeName: string;

  @Field(() => [VehicleType], { nullable: 'items' })
  vehicleTypes: VehicleType[];
}
