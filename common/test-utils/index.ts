import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { faker } from "@faker-js/faker";
import { PostConfirmationTriggerEvent } from "aws-lambda";

export const getAccount = async (id: string) => {
  const client = new DynamoDBClient({ region: process.env.AWS_REGION });
  const documentClient = DynamoDBDocument.from(client);
  const result = await documentClient.get({
    TableName: process.env.ACCOUNTS_TABLE,
    Key: { pk: id },
  });
  return result.Item;
};

export const aPostConfirmSignUpEvent = (overrides: {
  id?: string;
  email?: string;
  username?: string;
}): PostConfirmationTriggerEvent => {
  const { id, email, username } = {
    id: faker.datatype.uuid(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    ...overrides,
  };

  return {
    version: "1",
    userName: id,
    callerContext: { awsSdkVersion: "", clientId: "" },
    region: process.env.AWS_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    triggerSource: "PostConfirmation_ConfirmSignUp",
    request: {
      userAttributes: {
        sub: id,
        "cognito:email_alias": email,
        "cognito:user_status": "CONFIRMED",
        email_verified: "true",
        email: email,
        preferred_username: username,
      },
    },
    response: {},
  };
};

export const aNewUser = (overrides: { username?: string }) => {
  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
  });

  const username = overrides.username ?? faker.internet.userName();
  const email = `success+${username}@simulator.amazonses.com`;
  const password = faker.internet.password(15, false, /\w/, "Prefix!_");

  return {
    async signsUp(): Promise<string> {
      const resp = await client.send(
        new SignUpCommand({
          ClientId: process.env.COGNITO_CLIENT_ID,
          Username: email,
          Password: password,
          UserAttributes: [{ Name: "preferred_username", Value: username }],
        })
      );
      return (
        resp.UserSub ?? fail(`Unable to signup user ${email}. No id found`)
      );
    },

    async confirms(userId: string): Promise<void> {
      await client.send(
        new AdminConfirmSignUpCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: userId,
        })
      );
    },
  };
};
