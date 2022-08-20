import base64url from 'base64url';
import { randomBytes, createHash } from 'crypto';
import axios from 'axios';
import logger from './util/logger';
import FormData from 'form-data';

const URL =
  'https://accounts.hubspaceconnect.com/auth/realms/thd/protocol/openid-connect/auth';
const SESSION_CODE_REGEX = /session_code=(.+?)&/;
const EXECUTION_REGEX = /execution=(.+?)&/;
const TAB_ID_REGEX = /tab_id=(.+?)&/;

const log = logger;

export interface CodeVerifierAndChallenge {
  verifier: string;
  challenge: string;
}

export interface RefreshToken {
  refreshToken: string;
  expires: Date;
}

export async function getRefreshToken(
  username: string,
  password: string
): Promise<RefreshToken> {
  log.debug('Refreshing token');
  const challenge = getCodeVerifierAndChallenge();
  log.debug(
    `Challenge/Verifier: ${challenge.challenge} / ${challenge.verifier}`
  );
  const sessionParams = {
    response_type: 'code',
    client_id: 'hubspace_android',
    redirect_uri: 'hubspace-app://loginredirect',
    code_challenge: challenge.challenge,
    code_challenge_method: 'S256',
    scope: 'openid offline_access',
  };

  const sessionResponse = await axios.get(URL, {
    params: sessionParams,
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await sessionResponse.data;
  const sessionCode = SESSION_CODE_REGEX.exec(data);
  const execution = EXECUTION_REGEX.exec(data);
  const tabId = TAB_ID_REGEX.exec(data);

  const authURL = `https://accounts.hubspaceconnect.com/auth/realms/thd/login-actions/authenticate?session_code=${sessionCode[1]}&execution=${execution[1]}&client_id=hubspace_android&tab_id=${tabId[1]}`;

  log.debug(`Auth URL: ${authURL}`);

  const authHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'user-agent':
      'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.69 Mobile Safari/537.36',
  };

  const authParams = new URLSearchParams({
    username: "twarne@gmail.com",
    password: "KrfTH@bcc72NvU_43e",
    credentialId: "",
  });

  const authResponse = await axios.post(authURL, authData, {
    headers: authHeaders,
  });
  return {
    refreshToken: '',
    expires: new Date(),
  };
}

export function getCodeVerifierAndChallenge(): CodeVerifierAndChallenge {
  const verifier = base64url
    .encode(randomBytes(40))
    .replace('[^a-zA-Z0-9]+', '');
  const challenge = base64url
    .encode(createHash('sha256').update(verifier).digest())
    .replace('=', '');
  return { verifier, challenge };
}
