/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, Contract } from 'ethers'
import { styled } from 'styled-components'
import { motion } from 'framer-motion'
import sleep from 'sleep-promise'
import config from './config'
import { a } from 'framer-motion/client'

const Body = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

const WalletButton = styled(motion.div)`
  position: absolute;
  right: 15px;
  top: 15px;
  min-width: 100px;
  background-color: #EAFF00;
  color: #444;
  padding: 10px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  border-radius: 4px;
  font-family: "SUSE Mono", sans-serif;
  cursor: pointer;
  transform: translate(0px, 0px);
  box-shadow: 5px 5px 0 0 rgba(0, 0, 0, 0.25);
`

const NavLinks = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 15px;
  font-family: "SUSE Mono", sans-serif; 
  color: #CBDD01;
  display: flex;
`

const Link = styled(motion.div)`
  margin-left: 10px;
  cursor: pointer;
`

const CalcWrapper = styled(motion.div)`
  background-color: #EAFF00;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 5px 5px 0 0 rgba(0, 0, 0, 0.25);
`

const CalcDisplay = styled.div`
  background-color: #CBDD01;
  width: 280px;
  height: 100px;
  border-radius: 4px;
  box-shadow: inset 5px 5px 0 0 rgba(0, 0, 0, 0.25);
  margin-bottom: 20px;
  position: relative;
`

const CalcBalance = styled.div`
  position: absolute;
  bottom: 66px;
  left: 15px;
  font-size: 13px;
  color: #666;
  font-family: "SUSE Mono", sans-serif;
  overflow-x: scroll;
  width: 250px;
`

const CalcPrevResult = styled.div`
  position: absolute;
  bottom: 38px;
  left: 15px;
  font-size: 22px;
  color: #444;
  font-family: "SUSE Mono", sans-serif;
  overflow-x: scroll;
  width: 250px;
`

const CalcResult = styled.div`
  position: absolute;
  bottom: 5px;
  left: 15px;
  font-size: 32px;
  font-family: "SUSE Mono", sans-serif;
  overflow-x: scroll;
  width: 250px;
`

const Row = styled.div`
  height: 62.5px;
  display: flex;
  margin-bottom: 10px;
`

const CalcBtn = styled(motion.div)`
  background-color: #CBDD01;
  width: 62.5px;
  height: 62.5px;
  border-radius: 4px;
  transform: translate(0px, 0px);
  box-shadow: 5px 5px 0 0 rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  margin-right: 10px;
  font-family: "SUSE Mono", sans-serif;
  cursor: pointer;
`

const calcBtnAnimation = {
  transform: 'translate(5px, 5px)',
  boxShadow: '0px 0px 0 0 rgba(0, 0, 0, 0.25)'
}

const CalcApp = () => {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider('eip155')

  const [balance, setBalance] = useState(0)
      , [prevInput, setPrevInput] = useState('')
      , [mainInput, setMainInput] = useState('0')
      , [isCalcing, setIsCalcing] = useState(false)

  const createCallContract = async (isNotConnected = false) => {
    if ((!walletProvider || !address) && !isNotConnected) {
      open()
      return
    }

    const provider = new BrowserProvider(walletProvider)
    const signer = await provider.getSigner()
    
    return new Contract(config.contractAddress, config.contractABI, signer)
  }

  const getBalance = async isNotConnected => {
    const contract = await createCallContract(isNotConnected)

    const balance = await contract.balanceOf(address)
    setBalance(balance.toString())
  }

  const getUpdate = async () => {
    try {
      const contract = await createCallContract()
      const update = await contract.updateCalc()
      if (window.prevUpdate !== update.toString()) {
        window.prevUpdate = update.toString()
        return true
      }
    } catch (e) {}
    return false
  }

  const getResult = async () => {
    const contract = await createCallContract()
    const result = await contract.resultCalc()
    return result.toString()
  }
  
  const executeCalc = async (a, op, b) => {
    try {
      const contract = await createCallContract()

      setPrevInput([a, op, b].join('')+'=')
      setIsCalcing(true)

      await contract.calc(a, b, op === '+' ? 0 : op === '-' ? 1 : op === '×' ? 3 : 2)

      for (let x = 0; x < 10; x++) {
        if (await getUpdate()) {
          await getBalance()
          const result = await getResult()
          setIsCalcing(false)
          setMainInput(result)
          return
        }
        await sleep(1000)
      }

      setPrevInput('error')
      setMainInput([a, op, b].join(''))
      setIsCalcing(false)
    } catch (e) {
      console.log(e)
      setPrevInput('error')
      setMainInput([a, op, b].join(''))
      setIsCalcing(false)
    }
  }

  const handleCalcBtn = async btn => {
    if (btn === '=') {
      const [a, op, b] = mainInput.split(/(\+|-|×|÷)/)
      await executeCalc(a, op, b)
    }

    if (btn === 'c') {
      setMainInput('0')
    }

    if (btn === '+' || btn === '-' || btn === '÷' || btn === '×') {
      setMainInput(data => {
        if (data.length === 0) {
          return data
        }

        if (data.match(/(\+|-|×|÷)/gi)) {
          return data.replace(/(\+|-|×|÷)/gi, btn)
        }

        return `${data}${btn}`
      })
    }

    if (typeof btn === 'number') {
      setMainInput(data => {

        if (data[0] === '0') {
          return `${btn}`
        }

        return `${data}${btn}`
      })
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      getBalance(true)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [isConnected, address])

  useEffect(() => {
    if (isConnected) {
      const timeId = setTimeout(() => {
        getUpdate()
        getBalance()
      }, 1000)

      return () => clearTimeout(timeId)
    }
  }, [isConnected, getBalance])

  return (
    <Body>
      <WalletButton 
        drag
        dragTransition={{
          bounceStiffness: 100,
          bounceDamping: 10
        }}
        dragSnapToOrigin
        onClick={() => open()}
        whileTap={{
          transform: 'translate(5px, 5px)',
          boxShadow: '0px 0px 0 0 rgba(0, 0, 0, 0.25)'
        }}
      >
        {
          isConnected ? 'Wallet' : 'Connect wallet'
        }
      </WalletButton>
      <NavLinks>
        <Link 
          className='link'
          drag
          dragTransition={{
            bounceStiffness: 100,
            bounceDamping: 10
          }}
          dragSnapToOrigin
          whileDrag={{
            scale: 1.05,
            cursor: 'grab'
          }}
          style={{ cursor: 'pointer' }}
          onClick={() => setTimeout(() => window.open('https://pancakeswap.finance/swap?chain=bsc&chainOut=bsc&inputCurrency=BNB&outputCurrency=0x2b24FD04c05C74184FB927aba9C3272F83f9Feb1&exactAmount=1000&exactField=OUTPUT', '_blank'), 100)}
        >PancakeSwap</Link>
        <Link 
          className='link'
          drag
          dragTransition={{
            bounceStiffness: 100,
            bounceDamping: 10
          }}
          dragSnapToOrigin
          whileDrag={{
            scale: 1.05,
            cursor: 'grab'
          }}
          style={{ cursor: 'pointer' }}
          onClick={() => setTimeout(() => window.open('https://dexscreener.com/bsc/0x2b24FD04c05C74184FB927aba9C3272F83f9Feb1', '_blank'), 100)}
        >Dexscreener</Link>
        <Link 
          className='link'
          drag
          dragTransition={{
            bounceStiffness: 100,
            bounceDamping: 10
          }}
          dragSnapToOrigin
          whileDrag={{
            scale: 1.05,
            cursor: 'grab'
          }}
          style={{ cursor: 'pointer' }}
          onClick={() => setTimeout(() => window.open('https://bscscan.com/token/0x2b24fd04c05c74184fb927aba9c3272f83f9feb1', '_blank'), 100)}
        >Contract</Link>
        <Link 
          className='link'
          drag
          dragTransition={{
            bounceStiffness: 100,
            bounceDamping: 10
          }}
          dragSnapToOrigin
          whileDrag={{
            scale: 1.05,
            cursor: 'grab'
          }}
          style={{ cursor: 'pointer' }}
          onClick={() => setTimeout(() => window.open('https://github.com/prohetamine/pay-calc', '_blank'), 100)}
        >GitHub</Link>
      </NavLinks>
      <CalcWrapper
        drag
        dragTransition={{
          bounceStiffness: 100,
          bounceDamping: 10
        }}
        dragSnapToOrigin
        whileDrag={{
          scale: 1.05,
          cursor: 'grab'
        }}
      >
        <CalcDisplay>
          <CalcBalance>Balance {balance} PCL</CalcBalance>
          <CalcPrevResult>{prevInput}</CalcPrevResult>
          <CalcResult>{isCalcing ? '...' : mainInput}</CalcResult>
        </CalcDisplay>
        <Row> 
          <CalcBtn onClick={() => handleCalcBtn(1)} whileTap={calcBtnAnimation}>1</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn(2)} whileTap={calcBtnAnimation}>2</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn(3)} whileTap={calcBtnAnimation}>3</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn('÷')} whileTap={calcBtnAnimation} style={{ marginRight: '0px' }}>÷</CalcBtn>
        </Row>
        <Row> 
          <CalcBtn onClick={() => handleCalcBtn(4)} whileTap={calcBtnAnimation}>4</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn(5)} whileTap={calcBtnAnimation}>5</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn(6)} whileTap={calcBtnAnimation}>6</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn('×')} whileTap={calcBtnAnimation} style={{ marginRight: '0px' }}>×</CalcBtn>
        </Row>
        <Row> 
          <CalcBtn onClick={() => handleCalcBtn(7)} whileTap={calcBtnAnimation}>7</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn(8)} whileTap={calcBtnAnimation}>8</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn(9)} whileTap={calcBtnAnimation}>9</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn('-')} whileTap={calcBtnAnimation} style={{ marginRight: '0px' }}>-</CalcBtn>
        </Row>
        <Row style={{ marginBottom: '0px' }}> 
          <CalcBtn onClick={() => handleCalcBtn(0)} whileTap={calcBtnAnimation}>0</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn('c')} whileTap={calcBtnAnimation}>C</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn('=')} whileTap={calcBtnAnimation}>=</CalcBtn>
          <CalcBtn onClick={() => handleCalcBtn('+')} whileTap={calcBtnAnimation} style={{ marginRight: '0px' }}>+</CalcBtn>
        </Row>
      </CalcWrapper>
    </Body>
  )
}

export default CalcApp