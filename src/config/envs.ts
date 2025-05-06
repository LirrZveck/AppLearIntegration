import 'dotenv/config';

import * as Joi from 'joi';

interface EnvVars {
  PGDATABASE: string;
  PGHOST: string;
  PGPASSWORD: string;
  PGPORT: number;
  PGUSER: string;
  ENVIRONMENT: string;
  APPPORT: number;
}

const envsSchema = Joi.object({
  PGDATABASE: Joi.string().required(),
  PGHOST: Joi.string().required(),
  PGPASSWORD: Joi.string().required(),
  PGPORT: Joi.number().required(),
  PGUSER: Joi.string().required(),
  ENVIRONMENT: Joi.string().required(),
  APPPORT: Joi.number().required(),

  //CONNECTIONSTRING: Joi.string().required(),
}).unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PGPORT,
  host: envVars.PGHOST,
  password: envVars.PGPASSWORD,
  database: envVars.PGDATABASE,
  user: envVars.PGUSER,
  ENVIRONMENT: envVars.ENVIRONMENT, // ✅ Aquí debe estar con mayúsculas
  appport: envVars.APPPORT,
};
