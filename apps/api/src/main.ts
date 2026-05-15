import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isDev = process.env.NODE_ENV !== 'production';

  // Trust Caddy/Nginx reverse-proxy so secure cookies work over HTTPS
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.enableCors({
    origin: isDev
      ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
      : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Hush API')
    .setDescription('API pour le jeu Hush - tiens le silence le plus longtemps')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
