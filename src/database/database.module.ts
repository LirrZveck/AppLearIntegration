import { Global, Module } from '@nestjs/common';
import { Client } from 'pg';
import { envs } from 'src/config';

  
   const client = new Client({
    user: envs.user,
    host: envs.host,
    database: envs.database,
    password: envs.password,
    port: envs.port,
  });
  
   client.connect();
  // client.query('SELECT * FROM products', (err, res) => {
  //   console.error(err);
  //   console.log(res.rows);
  // });

@Global()
@Module({
    providers: [
        {
            provide: 'postgresConnection',
            useValue: client
        }
    ],
    exports:['postgresConnection'],
})
export class DatabaseModule {}
