import { task, types } from "hardhat/config"

task("verify:eventConnect", "Verify a EventConnect contract")
    .addParam("address", "EventConnect contract address", undefined, types.string)
    .setAction(async ({ address }, { run }): Promise<void> => {
        try {
            await run("verify:verify", {
                address
            })
        } catch (error) {
            console.error(error)
        }
    })
