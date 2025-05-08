import { Injectable } from '@nestjs/common';
import { Message } from 'src/messages/models/messages.model';

@Injectable()
export class MessagesService {
  //-----------------------------------INTERNAL ERROR 500--------------------------------------------
  errorConnectDB(dataBase: string, error: string): Message {
    const messageResult = new Message();
    messageResult.message = [
      `Error to try connect DB ${dataBase} error: ${error}`,
    ];
    messageResult.error = `Internal Server Error`;
    messageResult.statusCode = 500;
    //messageResult.payload = null;

    return messageResult;
  }
  errorExcuteQuery(dataBase: string, error: string): Message {
    const messageResult = new Message();
    messageResult.message = [
      `Error to try execute sentence in ${dataBase} error: ${error}`,
    ];
    messageResult.error = `Internal Server Error`;
    messageResult.statusCode = 500;
    //messageResult.payload = null;

    return messageResult;
  }

  errorConnectService() {
    const messageResult = new Message();
    messageResult.error = 'Internal Server Error';
    messageResult.message = [
      `Service Unavailable, Please Contact Support`,
    ];
    messageResult.statusCode = 503;
    return messageResult;
  }

  internalServerError(){
    const messageResult = new Message();
    messageResult.error = 'Internal Server Error';
    messageResult.message = [
      `Service Unavailable, Please Contact Support`,
    ];
    messageResult.statusCode = 503;
    return messageResult;
  }

  generalError(error: any, message: string){
    const messageResult = new Message();
    messageResult.error = error;
    messageResult.message = [
      message,
    ];
    messageResult.statusCode = 500;
    return messageResult;
  }

  //-----------------------------------BAD REQUEST 404--------------------------------------------
  notFound(
    dataBase: string,
    variable: string,
    payload: any,
    dataType: string,
  ): Message {
    const messageResult = new Message();
    messageResult.message = [
      `La consulta ${variable} no ha retornado resultado en ${dataBase}`,
    ];
    messageResult.error = `Not Found`;
    messageResult.statusCode = 404;
    //messageResult.payload = { dataType, ...payload };

    return messageResult;
  }
  dataValidation(dataBase: string, payload: any, dataType: string): Message {
    const messageResult = new Message();
    messageResult.message = [`Data succesfull validated in ${dataBase}`];
    messageResult.statusCode = 200;
    //messageResult.payload = { dataType, ...payload };
    return messageResult;
  }

  connectionSuccesfull(dataBase: string): Message {
    const messageResult = new Message();
    messageResult.message = [`Connection succesfull in ${dataBase}`];
    messageResult.statusCode = 200;
    //messageResult.payload = null;
    return messageResult;
  }

  statusOk(message: string): Message {
    const messageResult = new Message();
    messageResult.message = [`Process execute succesfull`];
    messageResult.statusCode = 200;
    //messageResult.payload = null;
    return messageResult;
  }
}
