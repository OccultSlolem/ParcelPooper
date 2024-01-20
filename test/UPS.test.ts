import { generateAuthToken } from '../src/UPS/Authentication';
import dotenv from 'dotenv';
import { getUPSTrackingStatus } from '../src/UPS/Tracking';

dotenv.config();

const delayTime = 1500; // Delays by this many milliseconds between each test to prevent rate limiting

const accountNumber = process.env.UPS_ACCOUNT_NUMBER;
const clientId = process.env.UPS_CLIENT_ID;
const clientSecret = process.env.UPS_CLIENT_SECRET;

if (!accountNumber || !clientId || !clientSecret) {
  throw new Error('UPS account number, client ID, or client secret not set');
}

describe('OAuth Authentication', () => {
  beforeEach(async () => {
    await new Promise(resolve => setTimeout(resolve, delayTime));
  });

  it('should create a bearer token', async () => {
    const response = await generateAuthToken(
      accountNumber,
      clientId,
      clientSecret,
      true
    );
    console.log(response);
    expect(response).toHaveProperty('accessToken');
  });
  it('should throw an error if the credentials are invalid', async () => {
    await expect(
      generateAuthToken(accountNumber, 'invalid', 'invalid', true)
    ).rejects.toThrow();
  });
});

describe('Tracking API', () => {
  beforeEach(async () => {
    await new Promise(resolve => setTimeout(resolve, delayTime));
  });

  const trackingNumber  = '1Z12345E0305271640'; // Corresponds to a delivered UPS Ground package. Only exists in CIE.
  it('should get tracking status', async () => {
    const response = await getUPSTrackingStatus(
      trackingNumber,
      clientId,
      clientSecret,
      accountNumber,
      'en_US',
      true,
      true,
      undefined,
      true
    );
    console.log(response);
    expect(response).toHaveProperty('trackResponse');
    expect(response).toHaveProperty('lastStatus');
    // @ts-ignore (we already checked for the existence of lastStatus)
    expect(response.lastStatus.delivered).toBe(true);
  }, 10000);
  // This one has to go to the production endpoint as the CIE endpoint will ALWAYS return a 200
  // with tracking number 1Z1442YY7229014688 regardless of what is sent in the request.
  it('should throw an error if the tracking number is invalid', async () => {
    await expect(
      getUPSTrackingStatus(
        'invalid',
        clientId,
        clientSecret,
        accountNumber,
        'en_US',
        true,
        true,
        undefined,
        false
      )
    ).rejects.toThrow();
  }, 10000);
  it('should throw an error if neither an account number nor an authorization token is provided', async () => {
    await expect(
      getUPSTrackingStatus(
        trackingNumber,
        clientId,
        clientSecret,
        undefined,
        'en_US',
        true,
        true,
        undefined,
        true
      )
    ).rejects.toThrow();
  });
});
