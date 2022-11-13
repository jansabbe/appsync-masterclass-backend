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
