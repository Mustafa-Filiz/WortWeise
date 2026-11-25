import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    await app.init();
  });

  describe('GET /api', () => {
    it('should return Hello World!', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('GET /api/health', () => {
    it('should return a healthy status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((response) => {
          expect(response.body.status).toBe('ok');
          expect(response.body.timestamp).toBeDefined();
          expect(response.body.uptime).toBeGreaterThanOrEqual(0);
        });
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
