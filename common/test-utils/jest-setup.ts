import * as dotenv from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
dotenv.config();

const envVariables = [
  "STAGE",
  "COGNITO_USER_POOL_ID",
  "AWS_REGION",
  "ACCOUNTS_TABLE",
] as const;
type EnvVariable = typeof envVariables[number];
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<EnvVariable, string> {}
  }
}

beforeAll(async () => {
  const stackOutputAsString = await readFile(
    path.join(__dirname, ".stack-output.json"),
    "utf-8"
  );
  const stackOutput = JSON.parse(stackOutputAsString);

  process.env.AWS_REGION = stackOutput.AwsRegion;
  process.env.COGNITO_USER_POOL_ID = stackOutput.CognitoUserPoolId;

  envVariables.forEach((env) => {
    if (process.env[env] === undefined) {
      throw new Error(`${env} does not exist`);
    }
  });
});
