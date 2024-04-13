import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:eventConnect", "Deploy a EventConnect contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)

    .setAction(async ({ logs }, { ethers }): Promise<Contract> => {
        const ContractFactory = await ethers.getContractFactory("EventConnect")

        const contract = await ContractFactory.deploy()

        await contract.deployed()

        if (logs) {
            console.info(
                `EventConnect contract has been deployed to: ${contract.address}`
            )
        }

        return contract
    })
