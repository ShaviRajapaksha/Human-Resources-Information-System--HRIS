import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hris.com' },
    update: {},
    create: {
      email: 'admin@hris.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);


  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Engineering' },
      update: {},
      create: {
        name: 'Engineering',
        description: 'Software development team',
      },
    }),

    prisma.department.upsert({
      where: { name: 'Human Resources' },
      update: {},
      create: {
        name: 'Human Resources',
        description: 'HR and recruitment',
      },
    }),

    prisma.department.upsert({
      where: { name: 'Finance' },
      update: {},
      create: {
        name: 'Finance',
        description: 'Finance and accounting',
      },
    }),

    prisma.department.upsert({
      where: { name: 'Marketing' },
      update: {},
      create: {
        name: 'Marketing and branding',
        description: 'Marketing and branding',
      },
    }),

    prisma.department.upsert({
      where: { name: 'Operations' },
      update: {},
      create: {
        name: 'Operations',
        description: 'Business operations',
      },
    }),
  ]);

  console.log('✅ Departments created');


  // Create employees
  const employees = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@company.com',
      position: 'Senior Engineer',
      salary: 95000,
      departmentId: departments[0].id,
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@company.com',
      position: 'Product Manager',
      salary: 85000,
      departmentId: departments[0].id,
    },
    {
      firstName: 'Carol',
      lastName: 'Williams',
      email: 'carol@company.com',
      position: 'HR Manager',
      salary: 75000,
      departmentId: departments[1].id,
    },
    {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david@company.com',
      position: 'Financial Analyst',
      salary: 72000,
      departmentId: departments[2].id,
    },
    {
      firstName: 'Eva',
      lastName: 'Davis',
      email: 'eva@company.com',
      position: 'Marketing Lead',
      salary: 78000,
      departmentId: departments[3].id,
    },
    {
      firstName: 'Frank',
      lastName: 'Miller',
      email: 'frank@company.com',
      position: 'DevOps Engineer',
      salary: 92000,
      departmentId: departments[0].id,
    },
    {
      firstName: 'Grace',
      lastName: 'Wilson',
      email: 'grace@company.com',
      position: 'UX Designer',
      salary: 82000,
      departmentId: departments[0].id,
    },
    {
      firstName: 'Henry',
      lastName: 'Moore',
      email: 'henry@company.com',
      position: 'Operations Manager',
      salary: 88000,
      departmentId: departments[4].id,
    },
  ];


  const createdEmployees: any[] = [];

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];

    const existing = await prisma.employee.findUnique({
      where: {
        email: emp.email,
      },
    });


    if (!existing) {
      const created = await prisma.employee.create({
        data: {
          ...emp,
          lastName: emp.lastName,
          employeeId: `EMP00${i + 1}`,
          hireDate: new Date(2022, i % 12, (i + 1) * 3),
          status: 'ACTIVE',
        },
      });

      createdEmployees.push(created);

    } else {
      createdEmployees.push(existing);
    }
  }

  console.log('✅ Employees created');


  // Create leave records
  const leaveTypes = [
    'ANNUAL',
    'SICK',
    'ANNUAL',
    'SICK',
  ] as const;


  const leaveStatuses = [
    'APPROVED',
    'PENDING',
    'REJECTED',
    'APPROVED',
  ] as const;


  for (let i = 0; i < 4; i++) {
    await prisma.leave.create({
      data: {
        employeeId: createdEmployees[i].id,
        type: leaveTypes[i],
        startDate: new Date(2024, i + 1, 10),
        endDate: new Date(2024, i + 1, 14),
        reason: 'Personal reason',
        status: leaveStatuses[i],
      },
    });
  }

  console.log('✅ Leave records created');


  // Create payroll records
  const now = new Date();

  for (const emp of createdEmployees.slice(0, 5)) {

    await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        basicSalary: emp.salary,
        bonus: 1000,
        deductions: 500,
        netSalary: emp.salary + 1000 - 500,
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });

  }

  console.log('✅ Payroll records created');


  // Create attendance
  const today = new Date();

  const statuses = [
    'PRESENT',
    'PRESENT',
    'LATE',
    'PRESENT',
    'ABSENT',
    'PRESENT',
    'PRESENT',
    'PRESENT',
  ] as const;


  for (let i = 0; i < createdEmployees.length; i++) {

    await prisma.attendance.create({
      data: {
        employeeId: createdEmployees[i].id,
        date: today,

        checkIn:
          statuses[i] !== 'ABSENT'
            ? new Date(
                today.setHours(
                  9,
                  i % 3 === 2 ? 30 : 0,
                  0
                )
              )
            : null,

        checkOut:
          statuses[i] === 'PRESENT'
            ? new Date(today.setHours(17, 0, 0))
            : null,

        status: statuses[i],
      },
    });

  }

  console.log('✅ Attendance records created');


  console.log('\n🎉 Seeding complete!');
  console.log('Login with: admin@hris.com / admin123');
}


main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });