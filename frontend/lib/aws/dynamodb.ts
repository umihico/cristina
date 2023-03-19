import AWS from "aws-sdk";
export const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: process.env.REGION,
});

export const dynamoDbTableName =
  process.env.TABLE_NAME || "cristina-umihico-Record";
