import { envs } from './envs';

export enum Environments {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Live = 'live',
}

export const environmentFiles: Record<Environments, string> = {
  [Environments.Development]: '.env',
  [Environments.Staging]: '.stage.env',
  [Environments.Production]: '.prod.env',
  [Environments.Live]: '.live.env',
};
export const envFilePath =
  environmentFiles[envs.ENVIROMENT as Environments] || '.env';
