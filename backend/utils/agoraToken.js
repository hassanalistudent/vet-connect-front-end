// utils/agoraToken.js - ✅ FIXED for ESM
import pkg from "agora-token";
const { RtcTokenBuilder, RtcRole } = pkg;

const generateToken = (channelName, uid) => {
  const appID = process.env.APP_CERTIFICATE ? process.env.APP_ID : ''; // ✅ Server .env
  const appCertificate = process.env.APP_CERTIFICATE;
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  return token;
};

export default generateToken;
