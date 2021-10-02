import Mnemonic from "@shared/utils/mnemonic";
import crypto from "crypto";

describe("@mnemonic unit test", () => {
    test("#Read Mnemonic phrase test", async () => {
        const mnemonic = Mnemonic.parse(
            "프랑스 우정 시금치 의문 직업 선물 발톱 방바닥 흔히 장마 견해 원래 개선 평소 음성 관점 대규모 그룹",
            "ko"
        );
        const masterKey = await mnemonic!.toSeedAsync(); // eslint-disable-line @typescript-eslint/no-non-null-assertion

        expect(masterKey.toString("hex")).toBe(
            "b97b864b12e2439186cb05ea1261a0f3818500939016089e24a22bc47ff0a966aeaafa4fbdf04530fe48dba2ff1c51cd953ef478329f2c10a8b875966abae692"
        );
    });

    test("#Generate Mnemonic phrase test", async () => {
        jest.spyOn(crypto, "randomBytes").mockImplementationOnce(bytes => {
            return Buffer.from(
                "5175d9806b82c14167e59c8e853617b3bebdf8bfbf0bb515",
                "hex"
            );
        });

        const entropy = Mnemonic.genEntropy(24);

        const mnemonic = Mnemonic.generate(entropy, "ko");

        const masterKey = await mnemonic!.toSeedAsync(); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        const mnemonicPhrase = mnemonic?.phrase;

        expect(masterKey.toString("hex")).toBe(
            "6e49e08cb4c416b05456c68aaf565ecb72722918d24fdce55df9f29e88ad1b1c8b38cf7c0631fa070a43f81a02b11692d5fed9cc744323b2f46d5fe6580fc474"
        );
        expect(mnemonicPhrase).toBe(
            "보라색 입원 사탕 총리 단독 위협 월드컵 장래 역시 농업 압력 선배 필자 활짝 흔적 탤런트 장인 이전"
        );
    });
});
