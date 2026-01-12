import { bsc } from '@reown/appkit/networks'

const projectId = '1febfd92481d4ea997711d2ac4a363c0'
    , networks = [bsc]

const contractAddress = '0x2b24FD04c05C74184FB927aba9C3272F83f9Feb1'

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
