import { RemovalPolicy } from "aws-cdk-lib";
import { HttpMethods } from "aws-cdk-lib/aws-s3";
import { Bucket, NextjsSite, StackContext, Table } from "sst/constructs";

export function ExampleStack({ stack, app }: StackContext) {
  // Add your first construct
  // Create the table
  const table = new Table(stack, "Counter", {
    fields: {
      counter: "string",
    },
    primaryIndex: { partitionKey: "counter" },
    cdk: {
      table: {
        removalPolicy:
          app.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  const imageBucket = new Bucket(stack, "ImageBucket", {
    cdk: {
      bucket: {
        cors: [
          {
            allowedHeaders: ["*"],
            allowedMethods: [
              "PUT",
              "POST",
              "GET",
              "DELETE",
              "HEAD",
            ] as HttpMethods[],
            allowedOrigins: ["*"],
          },
        ],
        bucketName: `cristina-image-bucket-${app.stage}-${stack.account}`,
        removalPolicy:
          app.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  // Create a Next.js site
  const site = new NextjsSite(stack, "Site", {
    path: "frontend",
    environment: {
      // Pass the table details to our app
      REGION: app.region,
      TABLE_NAME: table.tableName,
      BUCKET_NAME: imageBucket.bucketName,
    },
  });

  // Allow the Next.js API to access the table
  site.attachPermissions([table]);
  site.attachPermissions([imageBucket]);

  // Show the site URL in the output
  stack.addOutputs({
    URL: site.url || "http://localhost:3000",
  });
}
