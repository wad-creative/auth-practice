import QRCode from "qrcode";

const otpOauthUrl = process.argv[2];

if (!otpOauthUrl) {
  throw new Error("Missing OTP Oauth URL");
}

async function main() {
  try {
    await QRCode.toFile("totp.png", otpOauthUrl);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
