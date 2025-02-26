import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    enviroment: {
      name: process.env.IDSERVICE,
      port: parseInt(process.env.PORT),
      db: process.env.DB,
      usser: process.env.USSER,
      pass: process.env.PASS,
      dns: process.env.DNS,
      server: process.env.SERVER,
      enviroment: process.env.ENVIROMENT,
    },
    apiKey: process.env.API_KEY,
  };
});
