import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const port = 3333;

const app = Fastify();
const prismaClient  =  new PrismaClient();

app.register(cors);

app.get('/hello', async() => {
	const habits = await prismaClient.habit.findMany();
	return habits;
});

app.listen({
	port,
}).then(() => {
	console.log('Server Running on localhost:3333');
});