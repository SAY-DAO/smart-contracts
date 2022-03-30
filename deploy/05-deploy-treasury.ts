import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains, NEED_RATIO } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployTreasury: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("------------------------- Treasury Deployment ---------------------------")
    log("Deploying Treasury ...")
    const treasury = await deploy("Treasury", {
        from: deployer,
        args: [NEED_RATIO],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    log(`Treasury deployed at at ${treasury.address}`)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(treasury.address, [NEED_RATIO], "contracts/Treasury.sol:Treasury")
    }
    const treasuryContract = await ethers.getContractAt("Treasury", treasury.address)
    const timeLock = await ethers.getContract("TimeLock")
    const ownerAddress = await treasuryContract.owner()
    if (ownerAddress !== timeLock.address) {
        const transferTx = await treasuryContract.transferOwnership(timeLock.address)
        await transferTx.wait(1)
    }
    log(`Treasury NOW is owned and governed by TimeLock: ${timeLock.address}`)

}

export default deployTreasury
deployTreasury.tags = ["all", "treasury"]