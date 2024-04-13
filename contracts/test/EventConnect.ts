import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { expect } from "chai"
import { BigNumber, utils } from "ethers"
import { run } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation.
// eslint-disable-next-line import/extensions
import { EventConnect } from "../typechain-types"

describe("EventConnect", () => {
    let eventConnect: EventConnect

    const groupId = utils.formatBytes32String("Name")
    const identities = [0, 1].map((i) => new Identity(i.toString()))
    const group = new Group(BigNumber.from(groupId).toBigInt(), 20)

    group.addMembers(identities.map(({ commitment }) => commitment))

    before(async () => {
        eventConnect = await run("deploy:eventConnect", {
            logs: false
        })
    })

    describe("# updateGroups", () => {
        it("Should update groups", async () => {
            const transaction = eventConnect.updateGroups([
                {
                    id: groupId,
                    fingerprint: group.root
                }
            ])

            await expect(transaction)
                .to.emit(eventConnect, "GroupUpdated")
                .withArgs(groupId, group.root)
        })
    })

    describe("# groups", () => {
        it("Should get the current fingerprint of an off-chain group", async () => {
            const fingerprint = await eventConnect.groups(groupId)

            expect(fingerprint).to.equal(group.root)
        })
    })

    describe("# updateFingerprintDuration", () => {
        it("Should update the fingerprint duration", async () => {
            const duration = 3600

            await eventConnect.updateFingerprintDuration(groupId, duration)

            const fingerprintDuration = await eventConnect.fingerprintDuration(
                groupId
            )

            expect(duration).to.equal(fingerprintDuration)
        })
    })
})
