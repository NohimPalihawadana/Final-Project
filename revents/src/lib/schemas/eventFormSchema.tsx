import { z } from "zod";

const requiredString = (fieldName: string) =>
  z
    .string()
    .min(1, { message: `${fieldName} is required` });

export const eventFormSchema = z.object({
  title: requiredString("Title"),
  category: requiredString("Category"),
  description: requiredString("Description").min(5,'Description must be at least 5 characters') ,
  date: requiredString("Date")
    .refine((value) => {
      const selectedDate = new Date(value);
      return selectedDate > new Date();
    }, {
      message: 'Date must be in the future'
    }),
  city: requiredString("City"),
  venue: requiredString("Venue"),
});

export type EventFormSchema = z.infer<typeof eventFormSchema>;
