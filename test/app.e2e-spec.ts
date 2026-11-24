import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthenticationService } from '../src/authentication/authentication.service';
import { MongoExceptionFilter } from '../src/common/mongo-exception.filter';

const describeIfDb = process.env.MONGO_URI ? describe : describe.skip;
process.env.JWT_SEED ??= 'e2e-secret-e2e-secret-e2e-secret-e2e';

describeIfDb('security (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new MongoExceptionFilter());
    await app.init();
    const conn = app.get<Connection>(getConnectionToken());
    await conn.dropDatabase();
    await Promise.all(Object.values(conn.models).map((m) => m.syncIndexes()));

    const auth = app.get(AuthenticationService);
    await auth.createUser(
      { name: 'Admin', email: 'admin@example.com', password: 'password123' },
      true,
    );
    adminToken = (
      await auth.authenticate({
        email: 'admin@example.com',
        password: 'password123',
      })
    ).token;
  });

  afterAll(() => app.close());

  const http = () => request(app.getHttpServer());

  it('rejects unsigned / forged admin tokens', async () => {
    const forged = jwt.sign({ user: { isAdmin: true } }, 'attacker-secret');
    await http()
      .get('/authentication/getall')
      .set('Authorization', `Bearer ${forged}`)
      .expect(401);
    await http()
      .get('/authentication/getall')
      .set('Authorization', 'Bearer garbage')
      .expect(401);
  });

  it('does not allow public admin registration', async () => {
    await http()
      .post('/authentication/register/admin')
      .send({ name: 'Eve', email: 'eve@example.com', password: 'password123' })
      .expect(401);
  });

  it('creates one user per email even under concurrent requests', async () => {
    const body = {
      name: 'Budi',
      email: 'budi@example.com',
      password: 'password123',
    };
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        http()
          .post('/authentication/register')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(body),
      ),
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 409)).toHaveLength(4);
    userId = results.find((r) => r.status === 201)!.body.user._id;

    const login = await http()
      .post('/authentication/login')
      .send({ email: body.email, password: body.password })
      .expect(201);
    expect(login.body.user.password).toBeUndefined();
    expect(Object.keys(jwt.decode(login.body.token) as object).sort()).toEqual([
      'exp',
      'iat',
      'isAdmin',
      'sub',
    ]);
    userToken = login.body.token;
  });

  it('prevents users from reading trips of other users (IDOR)', async () => {
    const other = await http()
      .post('/authentication/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Siti',
        email: 'siti@example.com',
        password: 'password123',
      })
      .expect(201);
    const trip = await http()
      .post('/trip')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        destinasiPerjalanan: 'Bali',
        tanggalMulaiPerjalanan: '2027-01-01',
        tanggalBerakhirPerjalanan: '2027-01-05',
        price: 5000000,
        description: 'Liburan',
        idUser: other.body.user._id,
      })
      .expect(201);

    await http()
      .get(`/trip/${trip.body._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
    await http()
      .get('/trip')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
    const mine = await http()
      .get('/trip/mytrip')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(mine.body).toHaveLength(0);
    expect(userId).toBeDefined();
  });

  it('validates trip date ranges', async () => {
    await http()
      .post('/trip')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        destinasiPerjalanan: 'Bali',
        tanggalMulaiPerjalanan: '2027-01-05',
        tanggalBerakhirPerjalanan: '2027-01-01',
        price: 1,
        description: 'x',
        idUser: userId,
      })
      .expect(400);
  });
});
