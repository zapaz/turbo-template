import type { HardhatRuntimeEnvironment } from "hardhat/types";

const deployTemplate = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const deployResult = await deploy("Template", {
    from: deployer,
    args: [],
    log: true
  });

  if (deployResult.newlyDeployed) {
    console.log("Template newly deployed");
  }
};
deployTemplate.tags = ["Template"];

export default deployTemplate;
