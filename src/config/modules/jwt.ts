/* eslint-disable security/detect-non-literal-fs-filename */
import { registerAs } from "@nestjs/config";
import fs from "fs";
import path from "path";

export default registerAs("jwt", () => ({
    algorithm: process.env.JWT_ALGORITHM || "RS256",
    privateKey: (
        process.env.JWT_PRIVATE_KEY ||
        fs
            .readFileSync(path.resolve(__dirname, "../../../.key/private.pem"))
            .toString()
    ).replace(/\\n/g, "\n"),
    publicKey: (
        process.env.JWT_PUBLIC_KEY ||
        fs
            .readFileSync(path.resolve(__dirname, "../../../.key/public.pem"))
            .toString()
    ).replace(/\\n/g, "\n"),
    accessExpiresIn: parseInt(
        process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "86400"
    ),
    refreshExpiresIn: parseInt(
        process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "604800"
    )
}));
