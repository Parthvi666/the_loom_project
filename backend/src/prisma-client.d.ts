// Keeps TypeScript usable when npm has not copied Prisma's generated wrapper declarations.
declare module '@prisma/client' {
  export class PrismaClient {
    [key: string]: any;
  }
}