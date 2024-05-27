import { base_decode } from 'near-api-js/lib/utils/serialize.js';
import elliptic from 'elliptic';
import BN from 'bn.js';
import keccak256 from 'keccak';
import hash from 'hash.js';
import bs58check from 'bs58check';
import { Buffer } from 'buffer';
import crypto from 'crypto';

const {ec: EC } = elliptic;

const rootPublicKey = 'secp256k1:4NfTiv3UsGahebgTaHyD9vF8KYKMBnfd6kh94mK6xv8fGBiJB8TBtFMP5WWXz6B89Ac1fbpzPwAvoyQebemHFwx3';

export function najPublicKeyStrToUncompressedHexPoint() {
  const res = '04' + Buffer.from(base_decode(rootPublicKey.split(':')[1])).toString('hex');
  return res;
}

async function sha256Hash(str) {
  const data = Buffer.from(str, 'utf8');
  const hashBuffer = crypto.createHash('sha256').update(data).digest();
  return Array.from(hashBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

function sha256StringToScalarLittleEndian(hashString) {
  const littleEndianString = hashString.match(/../g).reverse().join('');
  const scalar = new BN(littleEndianString, 16);
  return scalar;
}

export async function deriveChildPublicKey(
  parentUncompressedPublicKeyHex,
  signerId,
  path = ''
) {
  const ec = new EC('secp256k1');
  let scalar = await sha256Hash(`near-mpc-recovery v0.1.0 epsilon derivation:${signerId},${path}`);
  scalar = sha256StringToScalarLittleEndian(scalar);

  const x = parentUncompressedPublicKeyHex.substring(2, 66);
  const y = parentUncompressedPublicKeyHex.substring(66);

  const oldPublicKeyPoint = ec.curve.point(x, y);
  const scalarTimesG = ec.g.mul(scalar);
  const newPublicKeyPoint = oldPublicKeyPoint.add(scalarTimesG);

  return '04' + (
    newPublicKeyPoint.getX().toString('hex').padStart(64, '0') +
    newPublicKeyPoint.getY().toString('hex').padStart(64, '0')
  );
}

export function uncompressedHexPointToEvmAddress(uncompressedHexPoint) {
  const address = keccak256('keccak256').update(Buffer.from(uncompressedHexPoint.substring(2), 'hex')).digest('hex');
  return '0x' + address.substring(address.length - 40);
}

export async function uncompressedHexPointToBtcAddress(publicKeyHex, network) {
  const publicKeyBytes = Buffer.from(publicKeyHex, 'hex');
  const sha256HashOutput = crypto.createHash('sha256').update(publicKeyBytes).digest();
  const ripemd160 = hash.ripemd160().update(sha256HashOutput).digest();

  const network_byte = network === 'bitcoin' ? 0x00 : 0x6f;
  const networkByte = Buffer.from([network_byte]);
  const networkByteAndRipemd160 = Buffer.concat([networkByte, ripemd160]);

  const address = bs58check.encode(networkByteAndRipemd160);
  return address;
}
