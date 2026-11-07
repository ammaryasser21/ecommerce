import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { loggerMiddleware } from './middleware/logger.middleware.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

   app.use(loggerMiddleware);
  

  const port = process.env.PORT || 8000;
  await app.listen(port, () => {
    console.log('Server is running ...');
  });
}
await bootstrap();
