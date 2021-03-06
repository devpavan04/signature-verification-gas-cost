const hre = require('hardhat');
const { utils } = require('ethers');
const fs = require('fs');
const R = require('ramda');
const chalk = require('chalk');

const abiEncodeArgs = (deployed, contractArgs) => {
  if (!contractArgs || !deployed || !R.hasPath(['interface', 'deploy'], deployed)) return '';
  const encoded = utils.defaultAbiCoder.encode(deployed.interface.deploy.inputs, contractArgs);
  return encoded;
};

const deploy = async (contractName, _args = [], overrides = {}, libraries = {}) => {
  console.log(` 🛰  Deploying: ${contractName}`);

  const contractArgs = _args || [];
  const contractArtifacts = await hre.ethers.getContractFactory(contractName, { libraries: libraries });
  const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
  const encoded = abiEncodeArgs(deployed, contractArgs);

  fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);

  let extraGasInfo = '';

  if (deployed && deployed.deployTransaction) {
    const gasUsed = deployed.deployTransaction.gasLimit.mul(deployed.deployTransaction.gasPrice);

    extraGasInfo = `${utils.formatEther(gasUsed)} ETH, tx hash ${deployed.deployTransaction.hash}`;
  }

  console.log(' 📄', chalk.cyan(contractName), 'deployed to:', chalk.magenta(deployed.address));
  console.log(' ⛽', chalk.grey(extraGasInfo), '\n');

  if (hre.config.defaultNetwork !== 'localhost' && hre.config.defaultNetwork !== 'hardhat') {
    console.log(
      '\n 🚀 View contract on etherscan: ',
      chalk.green(`https://${hre.config.defaultNetwork}.etherscan.io/address/${deployed.address}`),
      '\n\n'
    );
  }

  if (!encoded || encoded.length <= 2) return deployed;

  fs.writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));

  return deployed;
};

async function main() {
  console.log(' 📡 Deploying...\n');

  await deploy('SigningModule');

  console.log(' 💾  Artifacts (address, abi, and args) saved to: ', chalk.blue('./artifacts'), '\n\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
