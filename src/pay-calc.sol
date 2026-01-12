// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PayCalc is ERC20, Ownable {
    address public _owner;
    uint256 public calcPrice = 1;
    mapping(address => uint256) public results;
    mapping(address => uint256) public updates;

    constructor() ERC20("PayCalc", "PCL") Ownable(msg.sender) {
        _owner = msg.sender;
        _mint(msg.sender, 1000000);
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    function resultCalc() view public returns (uint256) {
        return results[msg.sender];
    }

    function updateCalc() view public returns (uint256) {
        return updates[msg.sender];
    }

    function calc(
        uint256 a,
        uint256 b,
        uint8 op
    ) public returns (uint256) {
        require(balanceOf(msg.sender) >= calcPrice, "Not enough tokens");

        if (msg.sender != _owner) {
            _transfer(msg.sender, _owner, calcPrice);
        } else {
            _burn(msg.sender, calcPrice);
        }

        uint256 result;
        if (op == 0) { 
            result = a + b;
            require(result >= a && result >= b, "Addition overflow");
        }
        if (op == 1) {
            require(a >= b, "Subtraction underflow");
            result = a - b;
        }
        if (op == 2) {
            require(b != 0, "Division by zero");
            result = a / b;
        }
        if (op == 3) {
            result = a * b;
            require(result / a == b, "Multiplication overflow");
        }

        results[msg.sender] = result;
        updates[msg.sender] = block.number + 1;
        return result;
    }
}