import * as dotenv from "dotenv";
dotenv.config();

const envVariables = [
  "STAGE",
  "COGNITO_USER_POOL_ID",
  "AWS_REGION",
  "ACCOUNTS_TABLE",
] as const;

envVariables.forEach((env) => {
  if (process.env[env] === undefined) {
    throw new Error(`${env} does not exist`);
  }
});

type EnvVariable = typeof envVariables[number];
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<EnvVariable, string> {}
  }
}
