import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { VehiclesService } from './modules/vehicles/services/vehicles.service';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const vehiclesService = app.get(VehiclesService);
  await vehiclesService.fetchAndSaveMakes();
  await app.listen(3000);
}
bootstrap();
