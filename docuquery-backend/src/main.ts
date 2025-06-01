import { NestFactory } from '@nestjs/core'
import { AppModule } from './modules/app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT || 3000

  // Enable CORS if needed
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
  })

  // Use Helmet to secure the app by setting various HTTP headers
  app.use(helmet())

  // Optionally, apply rate limiting if needed
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  )

  // Use global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Document Management System')
    .setDescription('API documentation for the Document Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const swaggerDocument = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, swaggerDocument)

  // Graceful shutdown handling
  app.enableShutdownHooks()
  process.on('SIGINT', async () => {
    Logger.log('SIGINT signal received: closing HTTP server')
    await app.close()
    process.exit(0)
  })
  process.on('SIGTERM', async () => {
    Logger.log('SIGTERM signal received: closing HTTP server')
    await app.close()
    process.exit(0)
  })

  // Start the HTTP server
  await app.listen(port)

  Logger.log(`Application is running on: http://localhost:${port}`)
}

bootstrap()
