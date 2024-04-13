import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:eventConnect-semaphore", "Deploy a EventConnectSemaphore contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .addOptionalParam(
        "eventConnect",
        "EventConnect contract address",
        undefined,
        types.string
    )
    .addOptionalParam(
        "semaphoreVerifier",
        "SemaphoreVerifier contract address",
        undefined,
        types.string
    )
    .setAction(
        async (
            {
                logs,
                eventConnect: eventConnectAddress,
                semaphoreVerifier: semaphoreVerifierAddress
            },
            { ethers, run }
        ): Promise<Contract> => {
            if (!semaphoreVerifierAddress) {
                const PairingFactory = await ethers.getContractFactory(
                    "Pairing"
                )
                const pairing = await PairingFactory.deploy()

                await pairing.deployed()

                if (logs) {
                    console.info(
                        `Pairing library has been deployed to: ${pairing.address}`
                    )
                }

                const SemaphoreVerifierFactory =
                    await ethers.getContractFactory("SemaphoreVerifier", {
                        libraries: {
                            Pairing: pairing.address
                        }
                    })

                const semaphoreVerifier =
                    await SemaphoreVerifierFactory.deploy()

                await semaphoreVerifier.deployed()

                if (logs) {
                    console.info(
                        `SemaphoreVerifier contract has been deployed to: ${semaphoreVerifier.address}`
                    )
                }

                semaphoreVerifierAddress = semaphoreVerifier.address
            }

            if (!eventConnectAddress) {
                const eventConnect = await run("deploy:eventConnect", {
                    logs
                })

                eventConnectAddress = eventConnect.address
            }

            const ContractFactory = await ethers.getContractFactory(
                "EventConnectSemaphore"
            )

            const contract = await ContractFactory.deploy(
                semaphoreVerifierAddress,
                eventConnectAddress
            )

            await contract.deployed()

            if (logs) {
                console.info(
                    `EventConnectSemaphore contract has been deployed to: ${contract.address}`
                )
            }

            return contract
        }
    )
