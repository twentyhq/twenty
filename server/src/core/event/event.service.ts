import { Injectable } from '@nestjs/common';
import { CreateEventInput } from './dto/create-event.input';

@Injectable()
export class EventService {
  create(createEventInput: CreateEventInput) {
    createEventInput;
    return { success: true };
  }
}
