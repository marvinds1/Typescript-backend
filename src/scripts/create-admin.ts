import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthenticationService } from '../authentication/authentication.service';

async function main() {
  const [name, email] = process.argv.slice(2);
  const password = process.env.ADMIN_PASSWORD;
  if (!name || !email || !password) {
    throw new Error(
      'Usage: ADMIN_PASSWORD=... npm run create-admin -- "<name>" <email>',
    );
  }
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  try {
    const { user } = await app
      .get(AuthenticationService)
      .createUser({ name, email, password }, true);
    console.log(`Admin created: ${user.email}`);
  } finally {
    await app.close();
  }
}

main().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});
