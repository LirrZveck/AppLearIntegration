export class Message {
  message: string[];
  error: string;
  status: string;
  statusCode: number;
  payload: any;
}

export class MessageDto {
  readonly message: string[];
  readonly error: string;
  readonly status: string;
  readonly statusCode: number;
  readonly payload: any;
}
