// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Đang tạo dữ liệu mẫu...')

  // 1. Tạo 3 Admin (Khớp với code đăng nhập của bạn)
  const users = [
    { email: 'NguyenDuyAn@gmail.com', name: 'Nguyễn Duy An' },
    { email: 'Trung@gmail.com', name: 'Trung' },
    { email: 'Vinh@gmail.com', name: 'Vinh' },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {}, // Nếu có rồi thì không làm gì
      create: {
        email: u.email,
        name: u.name,
        password: 'admin@123', // Pass mặc định
        role: 'ADMIN'
      },
    })
  }

  // 2. Tạo Tài khoản mặc định
  await prisma.account.upsert({
    where: { name: 'Tiền mặt' },
    update: {},
    create: { name: 'Tiền mặt', initialBalance: 0, currentBalance: 0 }
  })
  
  await prisma.account.upsert({
    where: { name: 'Ngân hàng' },
    update: {},
    create: { name: 'Ngân hàng', initialBalance: 0, currentBalance: 0 }
  })

  // 3. Tạo một vài danh mục mẫu
  await prisma.category.createMany({
    skipDuplicates: true,
    data: [
        { name: 'Tiền thuê nhà', type: 'INCOME' },
        { name: 'Tiền cọc', type: 'INCOME' },
        { name: 'Điện nước', type: 'EXPENSE' },
        { name: 'Lương nhân viên', type: 'EXPENSE' },
    ]
  })

  console.log('✅ Xong! Đã tạo 3 Admin và dữ liệu mẫu.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })