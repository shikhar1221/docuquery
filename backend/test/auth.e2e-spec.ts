import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { AuthService } from '../src/modules/auth/auth.service';
import { UserRepository } from '../src/common/repositories/user.repository';
import { TokenRepository } from '../src/common/repositories/token.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../src/common/entities/user.entity';
import { RefreshTokenEntity } from '../src/common/entities/refresh-token.entity';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userRepository: UserRepository;
  let tokenRepository: TokenRepository;

  const testUser = {
    email: 'test@example.com',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER'
  };

  beforeAll(async () => {
    app = global.app;
    authService = app.get<AuthService>(AuthService);
    userRepository = app.get<UserRepository>(getRepositoryToken(UserEntity));
    tokenRepository = app.get<TokenRepository>(getRepositoryToken(RefreshTokenEntity));
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await userRepository.clear();
    await tokenRepository.clear();
  });

  describe('Authentication', () => {
    describe('POST /auth/register', () => {
      it('should register a new user', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser)
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.email).toBe(testUser.email);
            expect(res.body).not.toHaveProperty('password');
          });
      });

      it('should not register a user with existing email', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser);

        return request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser)
          .expect(400);
      });
    });

    describe('POST /auth/login', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser);
      });

      it('should login successfully with valid credentials', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
          });
      });

      it('should not login with invalid credentials', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });

    describe('POST /auth/refresh', () => {
      let refreshToken: string;

      beforeEach(async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser);

        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          });

        refreshToken = loginResponse.body.refreshToken;
      });

      it('should refresh token successfully', () => {
        return request(app.getHttpServer())
          .post('/auth/refresh')
          .send({ refreshToken })
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
          });
      });

      it('should not refresh with invalid token', () => {
        return request(app.getHttpServer())
          .post('/auth/refresh')
          .send({ refreshToken: 'invalid-token' })
          .expect(401);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});