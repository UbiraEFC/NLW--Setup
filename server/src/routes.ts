import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { prismaClient } from "./lib/prisma";

export async function appRoutes(app: FastifyInstance) {

	app.get('/hello', async () => {
		return { result: 'Hello World!' };
	});

	app.post('/habits', async (request) => {
		const createHabitBody = z.object({
			title: z.string(),
			weekDays: z.array(
				z.number().min(0).max(6)
			),
		});

		const { title, weekDays } = createHabitBody.parse(request.body);

		const today = dayjs().startOf('day').toDate();

		await prismaClient.habit.create({
			data: {
				title,
				created_at: today,
				weekDays: {
					create: weekDays.map(weekDay => {
						return {
							week_day: weekDay,
						}
					})
				}
			}
		})
	});

	app.get('/day', async (request) => {
		const getDayParams = z.object({
			date: z.coerce.date(),
		});

		const { date } = getDayParams.parse(request.query);

		const parsedDate = dayjs(date).startOf('day');
		const weekDay =  dayjs(date).get('day');

		const possibleHabits = await prismaClient.habit.findMany({
			where: {
				created_at: {
					lte: date,
				},
				weekDays: {
					some: {
						week_day: weekDay,
					}
				}
			}
		});

		const day =  await prismaClient.day.findUnique({
			where: {
				date: parsedDate.toDate(),
			},
			include: {
				dayHabit: true,
			}
		});

		const completedHabits = day?.dayHabit.map(day_habit => {
			return day_habit.habit_id;
		})

		return {
			possibleHabits,
			completedHabits
		}
	});

}
