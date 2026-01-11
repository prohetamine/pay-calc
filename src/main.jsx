import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createAppKit, AppKitProvider } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import './index.css'
import CalcApp from './CalcApp.jsx'
import config from './config.js'

createAppKit({
  projectId: config.projectId,
  adapters: [new EthersAdapter()],
  networks: config.networks,
  metadata: {
    name: 'Pay Calc',
    description: 'Example DApp with BSC by Prohetamine - Pay Calc',
    url: 'https://mywebsite.com',
    icons: ['https://mywebsite.com/icon.png']
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppKitProvider projectId={config.projectId} networks={config.networks}>
      <CalcApp />
    </AppKitProvider>
  </StrictMode>
)
