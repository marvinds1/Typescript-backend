import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Error as MongooseError, mongo } from 'mongoose';
import { Response } from 'express';

@Catch(
  mongo.MongoServerError,
  MongooseError.CastError,
  MongooseError.ValidationError,
)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: Error & { code?: number }, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (exception.code === 11000) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ statusCode: 409, message: 'Duplicate value' });
    }
    if (
      exception instanceof MongooseError.CastError ||
      exception instanceof MongooseError.ValidationError
    ) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ statusCode: 400, message: 'Invalid input' });
    }
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ statusCode: 500, message: 'Internal server error' });
  }
}
