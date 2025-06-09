import { Test } from '@nestjs/testing'
import { AppModule } from '../src/modules/app.module'
import { DataSource } from 'typeorm'
import { INestApplication } from '@nestjs/common'

declare global {
  var app: INestApplication;
  var dataSource: DataSource;
}

let moduleRef
let dataSource

beforeAll(async () => {
  try {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    const app = moduleRef.createNestApplication()
    await app.init()
    global.app = app

    dataSource = moduleRef.get(DataSource)
    global.dataSource = dataSource
    
    // Initialize database
    await dataSource.synchronize(true)
    
    // Create a transaction for database operations
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    
    try {
      // Drop all tables in reverse order
      await queryRunner.query('DROP TABLE IF EXISTS ingestion_status CASCADE')
      await queryRunner.query('DROP TABLE IF EXISTS documents CASCADE')
      await queryRunner.query('DROP TABLE IF EXISTS users CASCADE')
      
      // Recreate tables and sequences
      await dataSource.synchronize(true)
      
      await queryRunner.commitTransaction()
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  } catch (error) {
    console.error('Error during test setup:', error)
    throw error
  }
})

afterEach(async () => {
  try {
    if (global.dataSource && global.dataSource.isInitialized) {
      const entities = global.dataSource.entityMetadatas
      for (const entity of entities.reverse()) {
        await global.dataSource.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`)
      }
    }
  } catch (error) {
    console.error('Error during test cleanup:', error)
  }
})

afterAll(async () => {
  try {
    if (global.dataSource && global.dataSource.isInitialized) {
      await global.dataSource.destroy()
    }
    if (global.app) {
      await global.app.close()
    }
  } catch (error) {
    console.error('Error during test teardown:', error)
  }
})

jest.setTimeout(60000); // Increase timeout to 60 seconds