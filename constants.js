const { utils } = require('ethers');

const network = 'localhost';

// local
const arbitratorContract = 'AutoAppealableArbitrator';
const arbitrationFee = utils.parseEther('0.001').toNumber();

// testnet
const arbitratorAddress = '0xf54D6b97749ECD28F9EbF836Ed9cE0C387a2f0A1';

// local && testnet
const arbitrableContract = 'SafexMain';

// module.exports = { network, arbitratorContract, arbitrableContract, arbitrationFee, arbitratorAddress };

module.exports = { network };
