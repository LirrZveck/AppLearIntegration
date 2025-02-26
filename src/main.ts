import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { envs } from './config';
import { MovementsModule } from './movements/movements.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  //-----------------------SWAGGER------------------------------
  const logger = new Logger('MainRest');
  const configAlear = new DocumentBuilder()
    .setTitle('Alear Integration')
    .setDescription('Integration For Technologies At The Diamond Project')
    .addTag('Products')
    .setVersion('0.2')
    .build();
  const documentAlear = SwaggerModule.createDocument(app, configAlear, {
    include: [ProductModule, MovementsModule],
  });
  SwaggerModule.setup('docs', app, documentAlear);
  app.enableCors();
  await app.listen(process.env.APPPORT ?? 3000);
  logger.log(`App is running on port ${ envs.appport }`, bootstrap.name);
  logger.log(`Application is running on: http://localhost:${ envs.appport }`, bootstrap.name);
  logger.log(`Swagger docs available at: http://localhost:${ envs.appport }/docs`, bootstrap.name);
}
bootstrap();
 