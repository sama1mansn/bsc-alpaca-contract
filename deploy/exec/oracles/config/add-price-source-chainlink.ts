import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ChainLinkPriceOracle__factory } from "../../../../typechain";
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
  const TOKEN0_SYMBOLS = ["ETH"];
  const TOKEN1_SYMBOLS = ["USD"];
  const AGGREGATORV3S = ["0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e"];

  const config = getConfig();
  const tokenList: any = config.Tokens;
  const token0Addrs: Array<string> = TOKEN0_SYMBOLS.map((t) => {
    const addr = tokenList[t];
    if (addr === undefined) {
      throw `error: token: unable to find address of ${t}`;
    }
    return addr;
  });
  const token1Addrs: Array<string> = TOKEN1_SYMBOLS.map((t) => {
    const addr = tokenList[t];
    if (addr === undefined) {
      throw `error: token: unable to find address of ${t}`;
    }
    return addr;
  });

  const chainLinkPriceOracle = ChainLinkPriceOracle__factory.connect(
    config.Oracle.ChainLinkOracle,
    (await ethers.getSigners())[0]
  );
  console.log(">> Adding price source to chain link price oracle");
  await chainLinkPriceOracle.setPriceFeeds(token0Addrs, token1Addrs, AGGREGATORV3S);
  console.log("✅ Done");
};

export default func;
func.tags = ["AddSourceChainLinkPriceOracle"];
