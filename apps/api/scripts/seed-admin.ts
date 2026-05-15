import 'dotenv/config';
import * as readline from 'readline';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;
const forceUpsert = process.argv.includes('--force');

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    let username = '';
    while (username.length < 3) {
      username = (await prompt(rl, 'Username (min 3 chars): ')).trim();
      if (username.length < 3) console.log('Username must be at least 3 chars.');
    }

    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing && !forceUpsert) {
      console.error(
        `Admin "${username}" already exists. Use --force to overwrite.`,
      );
      process.exit(1);
    }

    let password = '';
    while (password.length < 12) {
      password = await prompt(rl, 'Password (min 12 chars): ');
      if (password.length < 12) console.log('Password must be at least 12 chars.');
    }

    const confirm = await prompt(rl, 'Confirm password: ');
    if (password !== confirm) {
      console.error('Passwords do not match.');
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    if (existing && forceUpsert) {
      await prisma.admin.update({
        where: { username },
        data: { passwordHash },
      });
    } else {
      await prisma.admin.create({ data: { username, passwordHash } });
    }

    console.log(
      `Admin "${username}" créé avec succès. Tu peux te connecter sur /auth/login.`,
    );
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
