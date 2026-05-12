import { db } from './app/lib/db';
async function main() {
  const c = await db.customer.findFirst({ where: { fullName: 'Habib Arifin Makhtum' }, include: { bookings: true, documents: true } });
  console.log(JSON.stringify(c, null, 2));
}
main().catch(console.error).finally(() => process.exit(0));
