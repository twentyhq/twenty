import { PrismaClient } from "@prisma/client";
import { seedCompanies } from "./companies";
import { seedWorkspaces } from "./workspaces";
import { seedPeople } from "./people";


const seed = async () => {
    const prisma = new PrismaClient()
    await seedWorkspaces(prisma)
    await seedCompanies(prisma)
    await seedPeople(prisma)
    await prisma.$disconnect()
  }
  
seed()