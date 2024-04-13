import { bytesToBigInt, fromHex } from "@zk-email/helpers";
import { generateCircuitInputs } from "@zk-email/helpers";
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim/index.js"
import fs from "fs"
import path from "path"


 
export const STRING_PRESELECTOR = "Registration confirmed for ";
export const MAX_HEADER_PADDED_BYTES = 1024;
export const MAX_BODY_PADDED_BYTES = 1536;
 
export async function generateTwitterVerifierCircuitInputs() {
    const rawEmail = fs.readFileSync(
        path.join(process.cwd(), "./emls/rawEmail.eml"),
        "utf8"
      );
    const dkimResult = await verifyDKIMSignature(Buffer.from(rawEmail));
    const emailVerifierInputs = generateCircuitInputs({
        rsaSignature: dkimResult.signature,
        rsaPublicKey: dkimResult.publicKey,
        body: dkimResult.body,
        bodyHash:dkimResult.bodyHash,
        message: dkimResult.message,
        shaPrecomputeSelector: STRING_PRESELECTOR,
        maxMessageLength: MAX_HEADER_PADDED_BYTES,
        maxBodyLength: MAX_BODY_PADDED_BYTES
    });
 
    const bodyRemaining = emailVerifierInputs.in_body_padded.map((c) => Number(c));
    const selectorBuffer = Buffer.from(STRING_PRESELECTOR);
    const usernameIndex = Buffer.from(bodyRemaining).indexOf(selectorBuffer) + selectorBuffer.length;
 
    const address = bytesToBigInt(fromHex("0x71C7656EC7ab88b098defB751B7401B5f6d897")).toString();
 
    const inputJson = {
        ...emailVerifierInputs,
        twitter_username_idx: usernameIndex.toString(),
        address,
    };
    fs.writeFileSync("./input.json", JSON.stringify(inputJson))
}
 
(async () => {
    await generateTwitterVerifierCircuitInputs();
}) ();