
    pragma solidity ^0.8.0;

    contract Escrow {
        address public agent = 0x10667def18473500000000000000000000000000;
        mapping(address => uint256) public deposits;

        modifier onlyAgent() {
            require(msg.sender == agent, "Only agent can call this.");
            _;
        }

        function deposit(address payee) public onlyAgent payable {
            uint256 amount = msg.value;
            deposits[payee] += amount;
        }

        function withdraw(address payee) public onlyAgent {
            // Insert milestone check logic here
            uint256 payment = deposits[payee];
            deposits[payee] = 0;
            payable(payee).transfer(payment);
        }
    }
    