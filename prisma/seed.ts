import { PrismaClient } from "../src/generated/prisma/index.js";
const prisma = new PrismaClient();

async function main() {
  // 用 email 當唯一值比較保險（建議 schema 補 @unique）
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      password: "hashed_pw_alice",
      name: "Alice",
      phone: "0911-111-111",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      password: "hashed_pw_bob",
      name: "Bob",
      phone: "0922-222-222",
    },
  });

  const hotel1 = await prisma.hotel.create({
    data: {
      name: "Sunrise Hotel",
      city: "Taipei",
      address: "中正區忠孝西路 1 號",
      description: "交通方便、鄰近車站",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1551776235-dde6d4829808",
            sortOrder: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1501117716987-c8e0041eba57",
            sortOrder: 2,
          },
        ],
      },
      roomTypes: {
        create: [
          { name: "標準雙人房", price: 2200, total: 5 },
          { name: "豪華四人房", price: 4200, total: 3 },
        ],
      },
    },
    include: { roomTypes: true },
  });

  const hotel2 = await prisma.hotel.create({
    data: {
      name: "Harbor View Inn",
      city: "Kaohsiung",
      address: "鹽埕區七賢三路 88 號",
      description: "港景房型、近輕軌",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
            sortOrder: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
            sortOrder: 2,
          },
        ],
      },
      roomTypes: {
        create: [
          { name: "商務雙人房", price: 2000, total: 6 },
          { name: "海景家庭房", price: 3800, total: 2 },
        ],
      },
    },
    include: { roomTypes: true },
  });

  await prisma.booking.create({
    data: {
      userId: alice.id,
      roomTypeId: hotel1.roomTypes[0].id,
      checkIn: new Date("2025-09-10"),
      checkOut: new Date("2025-09-12"),
      guests: 2,
      contactName: "Alice",
      contactPhone: "0911-111-111",
      status: "CONFIRMED",
    },
  });

  console.log("✅ seed 完成");
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
