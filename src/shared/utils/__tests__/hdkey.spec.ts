import HDKey, { getPrivateKey,walletPath } from "@shared/utils/hdkey";

describe("@hdkey unit test", () => {
    test("#Generate Hdkey test", () => {
        const masterKey = Buffer.from(
            `b97b864b12e2439186cb05ea1261a0f3818500939016089e24a22bc47ff0a966aeaafa4fbdf04530fe48dba2ff1c51cd953ef478329f2c10a8b875966abae692`,
            "hex"
        );
        const hdKey = HDKey.parseMasterSeed(masterKey);

        const path = walletPath({ account: 0, addressIndex: 0 });
        const childPrivKey = hdKey.derive(path).privateKey || "";

        const privateKey = getPrivateKey(childPrivKey);

        expect(privateKey.toLegacyString()).toBe(
            "5JHjQqDVYwmq4H3XXwFMGvcdyCNtWcCXNzJfKL5XL7Wp9p5xzEH"
        );
        expect(privateKey.getPublicKey().toLegacyString()).toBe(
            "EOS7vxZ5m7iNqHkXLTRCk2iWbsFJDxwN67C55UT3b4g5ih9zRV8zn"
        );
        expect(privateKey.toString()).toBe(
            "PVT_K1_USq9mQUVCqoGfFVjoTBssWkbYyJULSfBEt6A2n6EfAzDqjyvr"
        );
        expect(privateKey.getPublicKey().toString()).toBe(
            "PUB_K1_7vxZ5m7iNqHkXLTRCk2iWbsFJDxwN67C55UT3b4g5ihA64HwJs"
        );
    });
});
