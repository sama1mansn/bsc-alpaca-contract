import { ethers } from "hardhat";
import { MerkleDistributor__factory } from "../../../../typechain";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getDeployer } from "../../../../utils/deployer-helper";
import { getConfig } from "../../../entities/config";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    ░██╗░░░░░░░██╗░█████╗░██████╗░███╗░░██╗██╗███╗░░██╗░██████╗░
    ░██║░░██╗░░██║██╔══██╗██╔══██╗████╗░██║██║████╗░██║██╔════╝░
    ░╚██╗████╗██╔╝███████║██████╔╝██╔██╗██║██║██╔██╗██║██║░░██╗░
    ░░████╔═████║░██╔══██║██╔══██╗██║╚████║██║██║╚████║██║░░╚██╗
    ░░╚██╔╝░╚██╔╝░██║░░██║██║░░██║██║░╚███║██║██║░╚███║╚██████╔╝
    ░░░╚═╝░░░╚═╝░░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝╚═╝░░╚══╝░╚═════╝░
    Check all variables below before execute the deployment script
    */
  const config = getConfig();

  const MERKLE_ROOT = "";
  const FEATURE_TOKEN_ADDRESS = config.Tokens.pSTAKE!;

  console.log(">> Deploying a Merkle distributor contract");
  const deployer = await getDeployer();
  const MerkleDistributorContract = (await ethers.getContractFactory(
    "MerkleDistributor",
    deployer
  )) as MerkleDistributor__factory;
  const merkleDistributor = await MerkleDistributorContract.deploy(FEATURE_TOKEN_ADDRESS, MERKLE_ROOT);
  await merkleDistributor.deployed();
  console.log(`>> Deployed at ${merkleDistributor.address}`);
  console.log("✅ Done");
};

export default func;
func.tags = ["MerkleDistributor"];
