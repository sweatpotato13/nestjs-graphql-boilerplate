import { uuid as uuidv4 } from "@shared/utils/uuid";
import BN from "bn.js";
import uuid from "uuid";

describe("@uuid unit test", () => {
    test("#uuid test", () => {
        jest.spyOn(uuid, "v4").mockImplementationOnce(
            () => "fef096c1-1aec-4af6-8433-def0488dd11b"
        );

        const fastUuid = uuidv4();
        // const bn = new BN(`${fastUuid}`, "hex");
        const bn = new BN(`${"ffffffffffffffffffffffffffffffff"}`, "hex");
        console.log(bn.byteLength());
        console.log(bn.toString(10));
        console.log(bn.toString(16));

        expect(fastUuid).toBe("fef096c11aec4af68433def0488dd11b");
    });
});
