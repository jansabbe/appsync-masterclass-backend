import { PostConfirmationTriggerEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const documentClient = DynamoDBDocument.from(client);

export async function handler(event: PostConfirmationTriggerEvent) {
  if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
    const preferredUsername = event.request.userAttributes[
      "preferred_username"
    ].replaceAll(/[^a-zA-Z0-9_]+/g, "_");
    const user = {
      pk: event.userName,
      username: preferredUsername,
      acct: preferredUsername,
      createdAt: new Date().toJSON(),
      followersCount: 0,
      followingCount: 0,
      statusesCount: 0,
    };

    await documentClient.put({
      TableName: process.env.ACCOUNTS_TABLE,
      Item: user,
      ConditionExpression: "attribute_not_exists(pk)",
    });
  }
  return event;
}
