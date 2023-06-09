import { SSTConfig } from "sst";
import { MainStack } from "./stacks/MainStack";

export default {
  config(input) {
    return {
      name: "cristina",
      region: process.env.AWS_REGION,
    };
  },
  stacks(app) {
    app.stack(MainStack);
  }
} satisfies SSTConfig;
