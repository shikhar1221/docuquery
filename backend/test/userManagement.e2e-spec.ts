import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { UserService } from '../src/modules/userManagement/userManagement.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../src/common/entities/user.entity';
import { UserRepository } from '../src/common/repositories/user.repository';

describe('UserManagement E2E Tests', () => {
  let app: INestApplication;
  let userManagementService: UserService;
  let userRepository: UserRepository;
  let adminAccessToken: string;
  let userAccessToken: string;

  const adminUser = {
    email: 'admin@example.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  };

  const regularUser = {
    email: 'user@example.com',
    password: 'User123!',
    firstName: 'Regular',
    lastName: 'User',
    role: 'USER'
  };

  beforeAll(async () => {
    app = global.app;
    userManagementService = app.get<UserService>(UserService);
    userRepository = app.get<UserRepository>(getRepositoryToken(UserEntity));

    // Register and login admin user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(adminUser);

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });

    adminAccessToken = adminLoginResponse.body.accessToken;

    // Register and login regular user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(regularUser);

    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: regularUser.email,
        password: regularUser.password,
      });

    userAccessToken = userLoginResponse.body.accessToken;
  });

  describe('User Management', () => {
    describe('GET /users', () => {
      it('should allow admin to get all users', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(1);
          });
      });

      it('should not allow regular user to get all users', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${userAccessToken}`)
          .expect(403);
      });
    });

    describe('GET /users/:id', () => {
      let userId: string;

      beforeEach(async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'Test123!',
            firstName: 'Test',
            lastName: 'User',
            role: 'USER'
          });

        userId = response.body.id;
      });

      it('should allow admin to get specific user', () => {
        return request(app.getHttpServer())
          .get(`/users/${userId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.id).toBe(userId);
            expect(res.body.email).toBe('test@example.com');
          });
      });
    });

    describe('PATCH /users/:id', () => {
      let userId: string;

      beforeEach(async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'update@example.com',
            password: 'Update123!',
            firstName: 'Update',
            lastName: 'User',
            role: 'USER'
          });

        userId = response.body.id;
      });

      it('should allow admin to update user', () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name'
        };

        return request(app.getHttpServer())
          .patch(`/users/${userId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            expect(res.body.firstName).toBe(updateData.firstName);
            expect(res.body.lastName).toBe(updateData.lastName);
          });
      });

      it('should not allow regular user to update other users', () => {
        return request(app.getHttpServer())
          .patch(`/users/${userId}`)
          .set('Authorization', `Bearer ${userAccessToken}`)
          .send({ firstName: 'Unauthorized' })
          .expect(403);
      });
    });

    describe('DELETE /users/:id', () => {
      let userId: string;

      beforeEach(async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'delete@example.com',
            password: 'Delete123!',
            firstName: 'Delete',
            lastName: 'User',
            role: 'USER'
          });

        userId = response.body.id;
      });

      it('should allow admin to delete user', () => {
        return request(app.getHttpServer())
          .delete(`/users/${userId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .expect(200);
      });

      it('should not allow regular user to delete users', () => {
        return request(app.getHttpServer())
          .delete(`/users/${userId}`)
          .set('Authorization', `Bearer ${userAccessToken}`)
          .expect(403);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});