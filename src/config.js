import { bsc } from '@reown/appkit/networks'

const projectId = '1febfd92481d4ea997711d2ac4a363c0'
    , networks = [bsc]

const contractAddress = '0x662f61b9E9A9C8Faa9cE7C83f7376A8B7E69deB5'

const contractABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function calc(uint256 a, uint256 b, uint8 op) public returns (uint256)',
  'function resultCalc() view returns (uint256)',
  'function updateCalc() view returns (uint256)'
]

export default {
  projectId,
  networks,
  contractAddress,
  contractABI
}
