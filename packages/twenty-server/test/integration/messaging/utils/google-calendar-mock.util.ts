import { http, HttpResponse, type RequestHandler } from 'msw';

export const googleCalendarHandlers = (): RequestHandler[] => [
  http.get(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    () => HttpResponse.json({ items: [] }),
  ),
];
