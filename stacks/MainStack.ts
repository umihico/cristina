import { Duration, RemovalPolicy } from "aws-cdk-lib";
import {
  CacheCookieBehavior,
  CacheHeaderBehavior,
  CachePolicy,
  CacheQueryStringBehavior,
  ResponseHeadersPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpMethods } from "aws-cdk-lib/aws-s3";
import { NextjsSite, StackContext, StaticSite, Table } from "sst/constructs";

export function MainStack({ stack, app }: StackContext) {
  // openssl rand -hex 4
  // change direnv values if you change this
  const suffix = "38344208";

  // Add your first construct
  // Create the table
  const dynamoTable = new Table(stack, "Record", {
    fields: {
      path: "string",
      photoType: "string",
      displayOrder: "number",
      width: "number",
      height: "number",
    },
    primaryIndex: { partitionKey: "photoType", sortKey: "displayOrder" },
    cdk: {
      table: {
        tableName: `cristina-image-records-${app.stage}-${suffix}-v2`,
        removalPolicy:
          app.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  const domain = `cristina${
    app.stage === "prod" ? "" : "-" + app.stage
  }.umihi.co`;

  const photoCdn = new StaticSite(stack, "images", {
    path: "images",
    purgeFiles: false, // !!! NEVER SET THIS TO TRUE IN PRODUCTION. YOU WILL DELETE YOUR ALL PHOTOS !!!
    cdk: {
      distribution: {
        comment: "images",
      },
      bucket: {
        bucketName: `cristina-image-bucket-${app.stage}-${suffix}`,
        cors: [
          {
            allowedHeaders: ["*"],
            allowedMethods: ["PUT", "POST", "GET", "HEAD"] as HttpMethods[],
            allowedOrigins: ["*"],
          },
        ],
      },
    },
  });

  // set and replace this cache policy with current "/_next/image*" cache policy BY HAND in the console after deploy
  const imageCachePolicy = new CachePolicy(stack, "imageCachePolicy", {
    cachePolicyName: `imageCachePolicy-${app.stage}-${suffix}`,
    defaultTtl: Duration.days(365),
    minTtl: Duration.days(365),
    maxTtl: Duration.days(365),
    enableAcceptEncodingGzip: true,
    enableAcceptEncodingBrotli: true,
    queryStringBehavior: CacheQueryStringBehavior.all(),
    cookieBehavior: CacheCookieBehavior.none(),
    headerBehavior: CacheHeaderBehavior.none(),
  });

  // set and replace this cache policy with current "/_next/image*" cache policy BY HAND in the console after deploy
  const imageResponseHeaderPolicy = new ResponseHeadersPolicy(
    stack,
    "imageResponseHeaderPolicy",
    {
      responseHeadersPolicyName: `imageResponseHeaderPolicy-${app.stage}-${suffix}`,
      customHeadersBehavior: {
        customHeaders: [
          {
            header: "Cache-Control",
            override: true,
            value: "max-age=31536000,public,immutable",
          },
        ],
      },
    }
  );

  // Create a Next.js site
  const site = new NextjsSite(stack, "Site", {
    path: "frontend",
    customDomain: {
      domainName: domain,
      domainAlias: `www.${domain}`,
    },
    environment: {
      // Pass the table details to our app
      STAGE: app.stage,
      REGION: app.region,
      TABLE_NAME: dynamoTable.tableName,
      BUCKET_NAME:
        photoCdn.cdk?.bucket.bucketName ||
        (process.env.DEV_IMAGE_BUCKET_NAME as string),
      IMAGE_DOMAIN:
        photoCdn.cdk?.distribution.domainName ||
        (process.env.DEV_CLOUDFRONT_DOMAIN as string),
      UPLOAD_ENABLED: app.stage === "prod" ? "false" : "true",
      NEXT_PUBLIC_SHARABLE_GOOGLE_PHOTO_URL:
        process.env.NEXT_PUBLIC_SHARABLE_GOOGLE_PHOTO_URL || "none",
    },
  });

  // Allow the Next.js API to access the table
  site.attachPermissions([dynamoTable]);
  if (photoCdn.cdk) {
    site.attachPermissions([photoCdn.cdk.bucket]);
  }

  // Show the site URL in the output
  stack.addOutputs({
    URL: site.url || "http://localhost:3000",
  });
}
