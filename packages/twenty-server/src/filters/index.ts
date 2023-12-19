import { GlobalExceptionFilter } from 'src/filters/global-exception.filter';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { TypeOrmExceptionFilter } from 'src/filters/typeorm-exception.filter';

// Exceptions filters must be ordered from the least specific to the most specific
// If TypeOrmExceptionFilter handle something, HttpExceptionFilter will not handle it
// GlobalExceptionFilter will handle the rest of the exceptions
export const exceptionFilters = [
  GlobalExceptionFilter,
  HttpExceptionFilter,
  TypeOrmExceptionFilter,
];
