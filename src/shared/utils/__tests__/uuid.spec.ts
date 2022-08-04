import { uuid as uuidv4 } from "@shared/utils/uuid";
import uuid from "uuid";

describe("@uuid unit test", () => {
    test("#uuid test", () => {
        jest.spyOn(uuid, "v4").mockImplementationOnce(
            () => "fef096c1-1aec-4af6-8433-def0488dd11b"
        );

        const fastUuid = uuidv4();
        expect(fastUuid).toBe("fef096c11aec4af68433def0488dd11b");
    });

    test("#uuid test2", () => {
        const fastUuid = uuidv4();

        console.log(fastUuid);

        // expect(fastUuid).toBe("4af61aecfef096c18433def0488dd11b");
    });
});
