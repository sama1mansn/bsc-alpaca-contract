import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';
import {
  PancakeswapWorker,
  PancakeswapWorker__factory,
  Timelock__factory,
} from '../typechain';

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
  const WORKERS = [{
    WORKER_NAME: "BUSD-ALPACA Worker",
    VAULT_CONFIG_ADDR: '0x06d0c5B027C8e1BFce561B8af34B87A2A3Ff005d',
    WORKER_CONFIG_ADDR: '0x8ae5e14864090E9332Ceb238F7cEa183d7C056a7',
    REINVEST_BOT: '0xcf28b4da7d3ed29986831876b74af6e95211d3f9',
    POOL_ID: 20,
    VAULT_ADDR: '0x6ad3A0d891C59677fbbB22E071613253467C382A',
    BASE_TOKEN_ADDR: '0x354b3a11D5Ea2DA89405173977E271F58bE2897D',
    MASTER_CHEF_ADDR: '0xbCC50b0B0AFD19Ee83a6E79e6c01D51b16090A0B',
    PANCAKESWAP_ROUTER_ADDR: '0xf46A02489B99C5A4a5cC31AA3F9eBD6A501D4B49',
    ADD_STRAT_ADDR: '0x5D0c3a0C79fCe9c177D7140e975681447C747D05',
    LIQ_STRAT_ADDR: '0x3be48dD0b9AA62560AAF0bff2115cc8617A4BD70',
    REINVEST_BOUNTY_BPS: '300',
    WORK_FACTOR: '5200',
    KILL_FACTOR: '7000',
    MAX_PRICE_DIFF: '13000',
    TIMELOCK: '0xb3c3aE82358DF7fC0bd98629D5ed91767e45c337',
    EXACT_ETA: '1618916400',
    STRATS: [
      '0x1F7a8F41EA3cEbBd02Ee757cf3d4c9137dfFF208',
      '0x7Db9Be22E449153bb86ABeeF5D6e4C5b72E4F5B8'
    ]
  }]









  for(let i = 0; i < WORKERS.length; i++) {
    console.log("===================================================================================")
    console.log(`>> Deploying an upgradable PancakeswapWorker contract for ${WORKERS[i].WORKER_NAME}`);
    const PancakeswapWorker = (await ethers.getContractFactory(
      'PancakeswapWorker',
      (await ethers.getSigners())[0]
    )) as PancakeswapWorker__factory;
    const pancakeswapWorker = await upgrades.deployProxy(
      PancakeswapWorker,[
        WORKERS[i].VAULT_ADDR, WORKERS[i].BASE_TOKEN_ADDR, WORKERS[i].MASTER_CHEF_ADDR,
        WORKERS[i].PANCAKESWAP_ROUTER_ADDR, WORKERS[i].POOL_ID, WORKERS[i].ADD_STRAT_ADDR,
        WORKERS[i].LIQ_STRAT_ADDR, WORKERS[i].REINVEST_BOUNTY_BPS
      ]
    ) as PancakeswapWorker;
    await pancakeswapWorker.deployed();
    console.log(`>> Deployed at ${pancakeswapWorker.address}`);

    console.log(`>> Adding REINVEST_BOT`);
    await pancakeswapWorker.setReinvestorOk([WORKERS[i].REINVEST_BOT], true);
    console.log("✅ Done");

    console.log(`>> Adding Strategies`);
    await pancakeswapWorker.setStrategyOk(WORKERS[i].STRATS, true);
    console.log("✅ Done");

    const timelock = Timelock__factory.connect(WORKERS[i].TIMELOCK, (await ethers.getSigners())[0]);

    console.log(">> Timelock: Setting WorkerConfig via Timelock");
    await timelock.queueTransaction(
      WORKERS[i].WORKER_CONFIG_ADDR, '0',
      'setConfigs(address[],(bool,uint64,uint64,uint64)[])',
      ethers.utils.defaultAbiCoder.encode(
        ['address[]','(bool acceptDebt,uint64 workFactor,uint64 killFactor,uint64 maxPriceDiff)[]'],
        [
          [pancakeswapWorker.address], [{acceptDebt: true, workFactor: WORKERS[i].WORK_FACTOR, killFactor: WORKERS[i].KILL_FACTOR, maxPriceDiff: WORKERS[i].MAX_PRICE_DIFF}]
        ]
      ), WORKERS[i].EXACT_ETA
    );
    console.log("generate timelock.executeTransaction:")
    console.log(`await timelock.executeTransaction('${WORKERS[i].WORKER_CONFIG_ADDR}', '0', 'setConfigs(address[],(bool,uint64,uint64,uint64)[])', ethers.utils.defaultAbiCoder.encode(['address[]','(bool acceptDebt,uint64 workFactor,uint64 killFactor,uint64 maxPriceDiff)[]'],[['${pancakeswapWorker.address}'], [{acceptDebt: true, workFactor: ${WORKERS[i].WORK_FACTOR}, killFactor: ${WORKERS[i].KILL_FACTOR}, maxPriceDiff: ${WORKERS[i].MAX_PRICE_DIFF}}]]), ${WORKERS[i].EXACT_ETA})`)
    console.log("✅ Done");

    console.log(">> Timelock: Linking VaultConfig with WorkerConfig via Timelock");
    await timelock.queueTransaction(
      WORKERS[i].VAULT_CONFIG_ADDR, '0',
      'setWorkers(address[],address[])',
      ethers.utils.defaultAbiCoder.encode(
        ['address[]','address[]'],
        [
          [pancakeswapWorker.address], [WORKERS[i].WORKER_CONFIG_ADDR]
        ]
      ), WORKERS[i].EXACT_ETA
    );
    console.log("generate timelock.executeTransaction:")
    console.log(`await timelock.executeTransaction('${WORKERS[i].VAULT_CONFIG_ADDR}', '0','setWorkers(address[],address[])', ethers.utils.defaultAbiCoder.encode(['address[]','address[]'],[['${pancakeswapWorker.address}'], ['${WORKERS[i].WORKER_CONFIG_ADDR}']]), ${WORKERS[i].EXACT_ETA})`)
    console.log("✅ Done");
  }
};

export default func;
func.tags = ['PancakeswapWorkers'];