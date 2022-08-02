import bs58 from "bs58";
import crypto from "crypto";
import { ec } from "elliptic";
import { ecc } from "eosjs/dist/eosjs-ecc-migration";
import { PrivateKey } from "eosjs/dist/PrivateKey";
import { Aes } from "eosjs-ecc";
import KeyEncoder from "key-encoder";
import { combine,split } from "shamirs-secret-sharing-ts";

export const genRandomBytesWithBase58 = (bytes: number): string => {
    return bs58.encode(crypto.randomBytes(bytes));
};

/**
 *
 * @algorithm scryptSync(password, salt, keylen, option)
 * @param password - 패스워드
 * @param salt - 암호학 솔트
 * @param keylen - digest 길이
 * @param option - ScryptOptions { N?: number; r?: number; p?: number; maxmem?: number; }
 * @param N - CPU 비용
 * @param r - 메모리 비용
 * @param p - 병렬화(parallelization)
 * @param maxmem -
 *
 */
export const scrypt512 = (
    data: string,
    _salt?: string
): { digest: string; salt: string } => {
    const salt = _salt ? bs58.decode(_salt) : crypto.randomBytes(64);
    const digest = crypto.scryptSync(data, salt, 64, { N: 1024, r: 8, p: 1 });
    return { digest: bs58.encode(digest), salt: bs58.encode(salt) };
};

export const scrypt256 = (
    data: string,
    _salt?: string
): { digest: string; salt: string } => {
    const salt = _salt ? bs58.decode(_salt) : crypto.randomBytes(64);
    const digest = crypto.scryptSync(data, salt, 32, { N: 1024, r: 8, p: 1 });
    return { digest: bs58.encode(digest), salt: bs58.encode(salt) };
};

export const verifyScrypt512 = (
    digest: string,
    data: string,
    salt: string
): boolean => {
    return (
        digest ===
        bs58.encode(
            crypto.scryptSync(data, bs58.decode(salt), 64, {
                N: 1024,
                r: 8,
                p: 1
            })
        )
    );
};

export const verifyScrypt256 = (
    digest: string,
    data: string,
    salt: string
): boolean => {
    return (
        digest ===
        bs58.encode(
            crypto.scryptSync(data, bs58.decode(salt), 32, {
                N: 1024,
                r: 8,
                p: 1
            })
        )
    );
};

export const encryptWithAES256 = (
    secret: string,
    plainText: string
): string => {
    const key: Buffer = Buffer.from(bs58.decode(secret));
    const iv: Buffer = Buffer.from(key.slice(0, 16));
    const cipher: crypto.Cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encryptedText = cipher.update(plainText, "utf8", "hex");
    encryptedText += cipher.final("hex");
    return bs58.encode(Buffer.from(encryptedText, "hex"));
};

export const decryptWithAES256 = (
    secret: string,
    encryptedText: string
): string => {
    const key: Buffer = Buffer.from(bs58.decode(secret));
    const iv: Buffer = Buffer.from(key.slice(0, 16));
    const decipher: crypto.Decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        key,
        iv
    );
    try {
        let decryptedValue = decipher.update(
            bs58.decode(encryptedText),
            "hex",
            "utf8"
        );
        decryptedValue += decipher.final("utf8");
        return decryptedValue;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const sha256 = (message: string): string => {
    return crypto
        .createHash("sha256")
        .update(message)
        .digest("hex");
};

export const signHashWithECC = (data: string, privateKey: string): string => {
    try {
        return ecc.signHash(Buffer.from(data), privateKey);
    } catch (error) {
        throw new Error(error.message);
    }
};

export const recoverHashWithECC = (signature: string, data: string): string => {
    try {
        return ecc.recoverHash(signature, Buffer.from(data));
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 *
 * @param sourcePrivateKey: sender's private key
 * @param destinationPublicKey: receiver's public key
 * @param message: secret data
 */
export const publicKeyEncrypt = (
    sourcePrivateKey: string,
    destinationPublicKey: string,
    message: string
): string => {
    try {
        const enc = Aes.encrypt(
            sourcePrivateKey,
            destinationPublicKey,
            encodeURIComponent(message)
        );
        enc.nonce = enc.nonce.toString();
        enc.message = bs58.encode(enc.message);
        return JSON.stringify(enc);
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 *
 * @param destinationPrivateKey: receiver's private key
 * @param sourcePublicKey: sender's public key
 * @param serializedEncryptedMessage: JSON stringfy encrypted data
 */
export const decryptWithPrivateKey = (
    destinationPrivateKey: string,
    sourcePublicKey: string,
    serializedEncryptedMessage: string
): string => {
    try {
        const encryptedData = JSON.parse(serializedEncryptedMessage);
        return decodeURIComponent(
            Aes.decrypt(
                destinationPrivateKey,
                sourcePublicKey,
                encryptedData.nonce,
                Buffer.from(bs58.decode(encryptedData.message)),
                encryptedData.checksum
            )
        );
    } catch (error) {
        throw new Error(error.message);
    }
};

interface ISplitOption {
    shares: number;
    threshold: number;
}

export const splitKey = (key: string, option: ISplitOption): string[] => {
    return split(key, option).map(val => {
        return bs58.encode(val);
    });
};

export const mergeKey = (splitKey: string[]): string => {
    return combine(
        splitKey.map(val => {
            return bs58.decode(val);
        })
    ).toString();
};

export const getSortedPrivateKeys = (privateKeys: string[]): string[] => {
    return privateKeys.sort((a, b) =>
        PrivateKey.fromString(a)
            .getPublicKey()
            .toLegacyString() <
        PrivateKey.fromString(b)
            .getPublicKey()
            .toLegacyString()
            ? -1
            : 1
    );
};

export const genRsa256KeyPair = (passphrase?: string): any => {
    if (!passphrase) passphrase = crypto.randomBytes(32).toString();
    return crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "spki",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
            cipher: "aes-256-cbc",
            passphrase
        }
    });
};

// Pem으로 제공됨, 문자열로 치환할때 중간의 개행 부분이 space로 자동 변환 될 수 있음.
// 따라서 \n을 \\n으로 치환하여 저장필요 replace(/\n/g, "\\n").
// 사용시 \\n을 \n으로 치환 replace(/\\n/g, "\n").
export const genEccKeyPair = (
    entropy?: string | Buffer
): { privateKey: string; publicKey: string } => {
    if (!entropy) entropy = crypto.randomBytes(24);

    const secp256k1 = new ec("secp256k1");
    const encoder = new KeyEncoder("secp256k1");

    const keyPair = secp256k1.genKeyPair({ entropy });

    const privateKey = encoder.encodePrivate(
        keyPair.getPrivate("hex"),
        "raw",
        "pem"
    );

    const publicKey = encoder.encodePublic(
        keyPair.getPublic("hex"),
        "raw",
        "pem"
    );

    return {
        privateKey,
        publicKey
    };
};

export const pem2str = (pem: string): string => {
    return pem.replace(/\n/g, "\\n");
};

export const str2pem = (strPem: string): string => {
    return strPem.replace(/\\n/g, "\n");
};

export const getRawEccPrivateKey = (privateKey: string): string => {
    const encoder = new KeyEncoder("secp256k1");

    return encoder.encodePrivate(privateKey, "pem", "raw");
};

export const getRawEccPublicKey = (publicKey: string): string => {
    const encoder = new KeyEncoder("secp256k1");

    return encoder.encodePublic(publicKey, "pem", "raw");
};
