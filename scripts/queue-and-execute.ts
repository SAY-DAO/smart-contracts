import { ethers, network } from "hardhat"
import {
    FUNC,
    NEW_NEED_RATIO,
    PROPOSAL_DESCRIPTION,
    MIN_DELAY,
    developmentChains,
} from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"

export async function queueAndExecute(args: any[], functionToCall: string) {

    const treasury = await ethers.getContract("Treasury")
    const encodedFunctionCall = treasury.interface.encodeFunctionData(functionToCall, args)
    // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
    console.log(await treasury.fetchNeedRatio()) // before execution

    const governor = await ethers.getContract("GovernorContract")
    console.log("Queueing...")
    // to queue a proposal to the timelock.
    const queueTx = await governor.queue(
        [treasury.address], // address[] memory targets
        [0],   // uint256[] memory values
        [encodedFunctionCall],  // bytes[] memory calldatas
        descriptionHash //bytes32 descriptionHash
    )
    await queueTx.wait(1)

    if (developmentChains.includes(network.name)) {
        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)
    }

    console.log("Executing...")
    // this will fail on a testnet because you need to wait for the MIN_DELAY!

    const executeTx = await governor.execute(
        [treasury.address], // address[] memory targets,
        [0], // uint256[] memory values,
        [encodedFunctionCall], // bytes[] memory calldatas,
        descriptionHash // bytes32 descriptionHash
    )
    await executeTx.wait(1)
    console.log(await treasury.fetchNeedRatio()) // after execution
}

queueAndExecute([NEW_NEED_RATIO], FUNC)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })