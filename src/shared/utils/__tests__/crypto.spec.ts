import {
    genRandomBytesWithBase58,
    scrypt512,
    scrypt256,
    verifyScrypt512,
    verifyScrypt256,
    encryptWithAES256,
    decryptWithAES256,
    signHashWithECC,
    recoverHashWithECC,
    publicKeyEncrypt,
    decryptWithPrivateKey,
    splitKey,
    mergeKey,
    sha256,
    getSortedPrivateKeys,
    genRsa256KeyPair,
    genEccKeyPair,
    pem2str,
    str2pem,
    getRawEccPrivateKey,
    getRawEccPublicKey
} from "@shared/utils/crypto";
import jwt, { Algorithm } from "jsonwebtoken";
import crypto from "crypto";
import bs58 from "bs58";

describe("@crypto unit test", () => {
    test("#genRandomBytesWithBase58", () => {
        jest.spyOn(crypto, "randomBytes").mockImplementationOnce(bytes => {
            return Buffer.from(
                "5175d9806b82c14167e59c8e853617b3bebdf8bfbf0bb515",
                "hex"
            );
        });

        expect(genRandomBytesWithBase58(32)).toBe(
            "8RiuseB9E8tEf4uapjaT6dm2ztpnJFPnk"
        );
    });

    test("#str2pem", () => {
        const stringPemPrivateKey =
            "-----BEGIN EC PRIVATE KEY-----\nMHQCAQEEIFWxneuS36xByaJVy0IOhAefU+p514CWFppyW4QJpA+LoAcGBSuBBAAK\noUQDQgAE5Bg71nhqND1Vw1IyKpQtpWWW5llFB1TYYLUx9Kxk0Hlq9mZSHKlC/d/p\nGd41Lj4rt2D/e+JKZi52P06hEW1sgg==\n-----END EC PRIVATE KEY-----";

        const rawPemPrivateKey = str2pem(stringPemPrivateKey);

        const token = jwt.sign(
            {
                clientId: "4031db33-eba1-42b9-87b6-d6b8891ac6f0",
                accountName: "littesth.p"
            },
            rawPemPrivateKey,
            {
                algorithm: "ES256" as Algorithm
            }
        );

        const stringPemPublicKey =
            "-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE5Bg71nhqND1Vw1IyKpQtpWWW5llFB1TY\nYLUx9Kxk0Hlq9mZSHKlC/d/pGd41Lj4rt2D/e+JKZi52P06hEW1sgg==\n-----END PUBLIC KEY-----";
        const rawPemPublicKey = str2pem(stringPemPublicKey);

        const payload = jwt.verify(token, rawPemPublicKey, {
            algorithms: ["ES256"]
        }) as { clientId: string; accountName: string };

        expect(payload["clientId"]).toBe(
            "4031db33-eba1-42b9-87b6-d6b8891ac6f0"
        );
        expect(payload["accountName"]).toBe("littesth.p");
    });

    test("#signHashWithECC", () => {
        const privateKey =
            "5Jk43VfKsubZTDXThr8gYn3Z7KPH5CZALkuhF7BomCFXaydyMkU";

        const authMsg = "Hi895QjQboZVhC3Ao4yd5H";
        const signature = signHashWithECC(authMsg, privateKey);

        expect(signature).toBe(
            "SIG_K1_Jx8hSXUAYqZje9QDfZ4aTJeeC43U3HrP6kWFKJvmHdKK9TUp19VYta8yfpRqhSjUMssDdfd8vTEyLTXrUd6kot6kNKGefM"
        );
    });

    test("#recoverHashWithECC", () => {
        const authMsg = "Hi895QjQboZVhC3Ao4yd5H";

        const signature =
            "SIG_K1_Jx8hSXUAYqZje9QDfZ4aTJeeC43U3HrP6kWFKJvmHdKK9TUp19VYta8yfpRqhSjUMssDdfd8vTEyLTXrUd6kot6kNKGefM";

        // publicKey => PrivateKey.fromString("5Jk43VfKsubZTDXThr8gYn3Z7KPH5CZALkuhF7BomCFXaydyMkU").getPublicKey().toLegacyString();
        expect(recoverHashWithECC(signature, authMsg)).toBe(
            "EOS8MrjvEQXuUG6N6tfaitB5ALdFiQYDSwYxw3yZB7WXPPUPGbA9H"
        );
    });

    test("#encryptWithAES256", () => {
        const mnemonicPhrase =
            "프랑스 우정 시금치 의문 직업 선물 발톱 방바닥 흔히 장마 견해 원래 개선 평소 음성 관점 대규모 그룹";

        const secretKey = "562tauKXihhudc9rDPJTjh17jjbtM52gYuZoy2M6BKje";
        const encryptedMnemonic = encryptWithAES256(secretKey, mnemonicPhrase);

        expect(encryptedMnemonic).toBe(
            "8pzSX3r6ApYw3ih4gDTMsiDB71sShhC5z73dbuW5VQXRRAmtzuPp4fXL4wS5AXWUJkyXKPN5EPdFkXq87TXPA86yh1Q5yj1BdjLwVnfqq3K4doaCgt1P7nAyKHAjgdHgbZsByHWAktJTaCpKybGXGS1cktKc548xx22kEBDKYAB3rb17mRjkfF7AUd4SJrMnNbnLc3V3b7cnCMacSU3FMebz3JbYddauWqps3ArWH5suPrdG9xE4rdzzcXHoTBeFa3JwVetpx8koaAVLCAL9bJ2pH4tpord5QGADFBDdKAXLKHdZyx9dQLz68Ao83ASwf35XfuDz7fV4fG81FCLKvsU7fGqzMmmWtbJyvM11bWpfvpsoGqmdrshD5ddFi2X82Kg4xjorWMLZpL7FZnntuhX6Z6tJSR9R7vj9tSiZFgRPFowyLeSYdBZ34DgZEC6tgMfeuJ9Ray1"
        );
    });

    test("#decryptWithAES256", () => {
        const encryptedMnemonic =
            "8pzSX3r6ApYw3ih4gDTMsiDB71sShhC5z73dbuW5VQXRRAmtzuPp4fXL4wS5AXWUJkyXKPN5EPdFkXq87TXPA86yh1Q5yj1BdjLwVnfqq3K4doaCgt1P7nAyKHAjgdHgbZsByHWAktJTaCpKybGXGS1cktKc548xx22kEBDKYAB3rb17mRjkfF7AUd4SJrMnNbnLc3V3b7cnCMacSU3FMebz3JbYddauWqps3ArWH5suPrdG9xE4rdzzcXHoTBeFa3JwVetpx8koaAVLCAL9bJ2pH4tpord5QGADFBDdKAXLKHdZyx9dQLz68Ao83ASwf35XfuDz7fV4fG81FCLKvsU7fGqzMmmWtbJyvM11bWpfvpsoGqmdrshD5ddFi2X82Kg4xjorWMLZpL7FZnntuhX6Z6tJSR9R7vj9tSiZFgRPFowyLeSYdBZ34DgZEC6tgMfeuJ9Ray1";

        const secretKey = "562tauKXihhudc9rDPJTjh17jjbtM52gYuZoy2M6BKje";

        const mnemonicPhrase = decryptWithAES256(secretKey, encryptedMnemonic);
        expect(mnemonicPhrase).toBe(
            "프랑스 우정 시금치 의문 직업 선물 발톱 방바닥 흔히 장마 견해 원래 개선 평소 음성 관점 대규모 그룹"
        );
    });

    test("#splitKey&mergeKey", () => {
        const encryptedMnemonic =
            "8pzSX3r6ApYw3ih4gDTMsiDB71sShhC5z73dbuW5VQXRRAmtzuPp4fXL4wS5AXWUJkyXKPN5EPdFkXq87TXPA86yh1Q5yj1BdjLwVnfqq3K4doaCgt1P7nAyKHAjgdHgbZsByHWAktJTaCpKybGXGS1cktKc548xx22kEBDKYAB3rb17mRjkfF7AUd4SJrMnNbnLc3V3b7cnCMacSU3FMebz3JbYddauWqps3ArWH5suPrdG9xE4rdzzcXHoTBeFa3JwVetpx8koaAVLCAL9bJ2pH4tpord5QGADFBDdKAXLKHdZyx9dQLz68Ao83ASwf35XfuDz7fV4fG81FCLKvsU7fGqzMmmWtbJyvM11bWpfvpsoGqmdrshD5ddFi2X82Kg4xjorWMLZpL7FZnntuhX6Z6tJSR9R7vj9tSiZFgRPFowyLeSYdBZ34DgZEC6tgMfeuJ9Ray1";

        const secretKey = "562tauKXihhudc9rDPJTjh17jjbtM52gYuZoy2M6BKje";

        const splitedKey = splitKey(encryptedMnemonic, {
            shares: 3,
            threshold: 3
        });

        const mergedKey = mergeKey(splitedKey);

        expect(encryptedMnemonic).toBe(mergedKey);

        const mnemonicPhrase = decryptWithAES256(secretKey, mergedKey);

        expect(mnemonicPhrase).toBe(
            "프랑스 우정 시금치 의문 직업 선물 발톱 방바닥 흔히 장마 견해 원래 개선 평소 음성 관점 대규모 그룹"
        );
    });

    test("#scrypt512", () => {
        jest.spyOn(crypto, "randomBytes").mockImplementationOnce(bytes => {
            return Buffer.from(
                "c2292e5ab96f98cfed17093849da2a8650c7888a7b9f85cff917ddf8439c7d922adb06d4e9a0ab71ecc62fb0e8a812dc98c4191c711dbd0b9937d2d144249fb3",
                "hex"
            );
        });

        const mnemonicPhrase =
            "프랑스 우정 시금치 의문 직업 선물 발톱 방바닥 흔히 장마 견해 원래 개선 평소 음성 관점 대규모 그룹";

        const { digest, salt } = scrypt512(mnemonicPhrase);

        expect(salt).toBe(
            "4t9ho7eYBwa5XRazL11JFy5d6SXAS9WWC3YMM5tsBLvqnAsVN4ujakF5ekEemD8nDa876DcqLYxBa8XtFcegDfKQ"
        );

        expect(digest).toBe(
            "YQ4i56w1Wcnp4BdjMiM5kUx2hnkz66cXaMYnNK6bHHc6A4Ds1iy4Ea3GeUjx8YQb5fWMbPArP6wQZ1oDv7zQJ7A"
        );

        expect((bs58.decode(digest).toString("hex").length * 4) / 8).toBe(64);
    });

    test("#scrypt256", () => {
        jest.spyOn(crypto, "randomBytes").mockImplementationOnce(bytes => {
            return Buffer.from(
                "c2292e5ab96f98cfed17093849da2a8650c7888a7b9f85cff917ddf8439c7d922adb06d4e9a0ab71ecc62fb0e8a812dc98c4191c711dbd0b9937d2d144249fb3",
                "hex"
            );
        });

        const mnemonicPhrase =
            "프랑스 우정 시금치 의문 직업 선물 발톱 방바닥 흔히 장마 견해 원래 개선 평소 음성 관점 대규모 그룹";

        const { digest, salt } = scrypt256(mnemonicPhrase);

        expect(salt).toBe(
            "4t9ho7eYBwa5XRazL11JFy5d6SXAS9WWC3YMM5tsBLvqnAsVN4ujakF5ekEemD8nDa876DcqLYxBa8XtFcegDfKQ"
        );
        expect(digest).toBe("2phFN7Qg68JARmi8WXJmZFKB1pN9D2n97pebA5FvBNkU");

        expect((bs58.decode(digest).toString("hex").length * 4) / 8).toBe(32);
    });

    test("#verifyScrypt512", () => {
        const salt =
            "4t9ho7eYBwa5XRazL11JFy5d6SXAS9WWC3YMM5tsBLvqnAsVN4ujakF5ekEemD8nDa876DcqLYxBa8XtFcegDfKQ";
        const digest =
            "YQ4i56w1Wcnp4BdjMiM5kUx2hnkz66cXaMYnNK6bHHc6A4Ds1iy4Ea3GeUjx8YQb5fWMbPArP6wQZ1oDv7zQJ7A";
        const mnemonicPhrase =
            "프랑스 우정 시금치 의문 직업 선물 발톱 방바닥 흔히 장마 견해 원래 개선 평소 음성 관점 대규모 그룹";

        expect(verifyScrypt512(digest, mnemonicPhrase, salt)).toBe(true);
    });

    test("#verifyScrypt256", () => {
        const salt =
            "4t9ho7eYBwa5XRazL11JFy5d6SXAS9WWC3YMM5tsBLvqnAsVN4ujakF5ekEemD8nDa876DcqLYxBa8XtFcegDfKQ";
        const digest = "2phFN7Qg68JARmi8WXJmZFKB1pN9D2n97pebA5FvBNkU";
        const mnemonicPhrase =
            "프랑스 우정 시금치 의문 직업 선물 발톱 방바닥 흔히 장마 견해 원래 개선 평소 음성 관점 대규모 그룹";

        expect(verifyScrypt256(digest, mnemonicPhrase, salt)).toBe(true);
    });

    test("#getSortedPrivateKeys", () => {
        let privateKeys = [
            "5Jk43VfKsubZTDXThr8gYn3Z7KPH5CZALkuhF7BomCFXaydyMkU",
            "5Kc4aKMnZeDXPkp1mr4YuWTJhHj671tpTkHGa5YYo6cZPBVniMW",
            "5JYLX7HD4vZCdPQU11ADYL89NvHMobuphEpdcAqPmChCz3449mS",
            "5KdCT4pWC4bqy5fxtDCRsdTSVA89JdJnAXkMZAB811qYEAKt8ZP",
            "5JYhTZDsQetksuxCBCoswMZs7BRbErL8x8cCWpk2DvQp8tiStMq",
            "5JvRJvBXbSVtEWcqTKg8mwjWxWBAcVg3Yj56W3BiRTt7Et43PLF",
            "5JrWgpSqSwiXuve8xPebMqRpnNPd8TDRhHPcNzdUqTAgNV7BvzA",
            "5JQwa7UWsBGgNHBzx9Dfbgv8aPG1mY1wV1Em3t9AvkoK1VUCHVL",
            "5J8DLCisWbw5YxFfJP5yNvSag5XPjaWDThf5j8K8h1z1kM5i3CT",
            "5Jw5XifquanqDjisVNxkmaGNrujVAMZ1P6L2YTZqLf8BQSHTUKr",
            "5JLSimccgS9ubV5TxT1kuLbxbQhxy8SF77h5sGURKdpMViyJSNV",
            "5KGTRiRNi2ggQhDhXQy6o9CVWS413uHC4zqZmJ5y9V6WNoPWNoX",
            "5KUdnfyUbHy6yDBZ1LLqEEhjYjeFcMuci98CRB7tW5XUCr19WxB",
            "5JfHYZ7Ns33WCuhimQndayStNLxH9k1yKp1Cs4M9Gkz8AkehJY7",
            "5KJAKR5CNRVhbrVKe4jpGwU1SqJcQxLLdtPPtMh1Zhp86ie9g6F",
            "5KkShfZVdX9jzyzWMw1pVrWQ7ffV34sNNM1UorFrhRzofdyeGRt",
            "5KTHPVJiTG81nYT6jyzjG6NbCzrS8fiNpbvyqiuyMCaEK281xyy",
            "5KhV9hzgFtJiY5MG5Ls1Di2Dp5YAgCgFzZxX6qfwttmAJWkfnDN"
        ];

        privateKeys = getSortedPrivateKeys(privateKeys);

        const sortedPrivateKeys = [
            "5KhV9hzgFtJiY5MG5Ls1Di2Dp5YAgCgFzZxX6qfwttmAJWkfnDN",
            "5JrWgpSqSwiXuve8xPebMqRpnNPd8TDRhHPcNzdUqTAgNV7BvzA",
            "5KUdnfyUbHy6yDBZ1LLqEEhjYjeFcMuci98CRB7tW5XUCr19WxB",
            "5Jw5XifquanqDjisVNxkmaGNrujVAMZ1P6L2YTZqLf8BQSHTUKr",
            "5JYLX7HD4vZCdPQU11ADYL89NvHMobuphEpdcAqPmChCz3449mS",
            "5JQwa7UWsBGgNHBzx9Dfbgv8aPG1mY1wV1Em3t9AvkoK1VUCHVL",
            "5JfHYZ7Ns33WCuhimQndayStNLxH9k1yKp1Cs4M9Gkz8AkehJY7",
            "5KkShfZVdX9jzyzWMw1pVrWQ7ffV34sNNM1UorFrhRzofdyeGRt",
            "5KGTRiRNi2ggQhDhXQy6o9CVWS413uHC4zqZmJ5y9V6WNoPWNoX",
            "5Kc4aKMnZeDXPkp1mr4YuWTJhHj671tpTkHGa5YYo6cZPBVniMW",
            "5KdCT4pWC4bqy5fxtDCRsdTSVA89JdJnAXkMZAB811qYEAKt8ZP",
            "5JLSimccgS9ubV5TxT1kuLbxbQhxy8SF77h5sGURKdpMViyJSNV",
            "5JvRJvBXbSVtEWcqTKg8mwjWxWBAcVg3Yj56W3BiRTt7Et43PLF",
            "5JYhTZDsQetksuxCBCoswMZs7BRbErL8x8cCWpk2DvQp8tiStMq",
            "5KJAKR5CNRVhbrVKe4jpGwU1SqJcQxLLdtPPtMh1Zhp86ie9g6F",
            "5KTHPVJiTG81nYT6jyzjG6NbCzrS8fiNpbvyqiuyMCaEK281xyy",
            "5Jk43VfKsubZTDXThr8gYn3Z7KPH5CZALkuhF7BomCFXaydyMkU",
            "5J8DLCisWbw5YxFfJP5yNvSag5XPjaWDThf5j8K8h1z1kM5i3CT"
        ];

        privateKeys.map((privateKey, idx) => {
            expect(privateKey).toBe(sortedPrivateKeys[idx as number]);
        });
    });

    test("#genRsa256KeyPair", () => {
        const { publicKey, privateKey } = genRsa256KeyPair();
        const ecckey = genEccKeyPair();
        console.log(publicKey);
        console.log(privateKey);
        console.log(ecckey.publicKey);
        console.log(ecckey.privateKey);
    });
});
