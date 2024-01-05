import { createBearerToken } from "../src/UPS/Authentication";
import dotenv from "dotenv";

dotenv.config();

const accountNumber = process.env.UPS_ACCOUNT_NUMBER;
const clientId = process.env.UPS_CLIENT_ID;
const clientSecret = process.env.UPS_CLIENT_SECRET;

if (!accountNumber || !clientId || !clientSecret) {
  throw new Error("UPS account number, client ID, or client secret not set");
}

describe("UPS Authentication", () => {
  it("should create a bearer token", async () => {
    const response = await createBearerToken(
      accountNumber,
      clientId,
      clientSecret,
      true
    );
    console.log(response);
    expect(response).toHaveProperty("accessToken");
  });
});
