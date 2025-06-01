import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DocumentService } from 'src/modules/document/document.service';
import { UserRepository } from 'src/common/repositories/user.repository';
import { UserEntity } from 'src/common/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Document E2E Tests', () => {
  let app: INestApplication;
  let documentService: DocumentService;
  let userRepository: UserRepository;
  let accessToken: string;

  const testUser = {
    email: 'test@example.com',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER'
  };

  const testDocument = {
    title: 'Test Document',
    content: 'This is a test document content',
    tags: ['test', 'document']
  };

  beforeAll(async () => {
    app = global.app;
    documentService = app.get<DocumentService>(DocumentService);
    userRepository = app.get<UserRepository>(getRepositoryToken(UserEntity));

    // Register and login a test user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    accessToken = loginResponse.body.accessToken;
  });

  describe('Document Management', () => {
    describe('POST /documents', () => {
      it('should create a new document', () => {
        return request(app.getHttpServer())
          .post('/documents')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(testDocument)
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.title).toBe(testDocument.title);
            expect(res.body.content).toBe(testDocument.content);
            expect(res.body.tags).toEqual(testDocument.tags);
          });
      });

      it('should not create document without authentication', () => {
        return request(app.getHttpServer())
          .post('/documents')
          .send(testDocument)
          .expect(401);
      });
    });

    describe('GET /documents', () => {
      let documentId: string;

      beforeEach(async () => {
        const response = await request(app.getHttpServer())
          .post('/documents')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(testDocument);

        documentId = response.body.id;
      });

      it('should get all documents', () => {
        return request(app.getHttpServer())
          .get('/documents')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
          });
      });

      it('should get a specific document', () => {
        return request(app.getHttpServer())
          .get(`/documents/${documentId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.id).toBe(documentId);
            expect(res.body.title).toBe(testDocument.title);
          });
      });
    });

    describe('PATCH /documents/:id', () => {
      let documentId: string;

      beforeEach(async () => {
        const response = await request(app.getHttpServer())
          .post('/documents')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(testDocument);

        documentId = response.body.id;
      });

      it('should update a document', () => {
        const updateData = {
          title: 'Updated Title',
          content: 'Updated content'
        };

        return request(app.getHttpServer())
          .patch(`/documents/${documentId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            expect(res.body.title).toBe(updateData.title);
            expect(res.body.content).toBe(updateData.content);
          });
      });
    });

    describe('DELETE /documents/:id', () => {
      let documentId: string;

      beforeEach(async () => {
        const response = await request(app.getHttpServer())
          .post('/documents')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(testDocument);

        documentId = response.body.id;
      });

      it('should delete a document', () => {
        return request(app.getHttpServer())
          .delete(`/documents/${documentId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
      });

      it('should not delete non-existent document', () => {
        return request(app.getHttpServer())
          .delete('/documents/non-existent-id')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});