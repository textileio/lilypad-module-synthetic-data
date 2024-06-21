const fs = require('fs');
const seedrandom = require('seedrandom');
const archiver = require('archiver');
const solc = require('solc');

function getRandomInt(rng, max) {
    return Math.floor(rng() * max);
}

function getRandomAddress(rng) {
    return `0x${Math.floor(rng() * 16 ** 40).toString(16).padStart(40, '0')}`;
}

function generateERC20Contract(rng) {
    const tokenName = `Token${getRandomInt(rng, 10000)}`;
    const symbol = `TKN${getRandomInt(rng, 100)}`;
    const totalSupply = getRandomInt(rng, 1e6) + 1e6;
    const decimals = getRandomInt(rng, 18) + 1;

    return `
    pragma solidity ^0.8.0;

    contract ${tokenName} {
        string public name = "${tokenName}";
        string public symbol = "${symbol}";
        uint8 public decimals = ${decimals};
        uint256 public totalSupply = ${totalSupply} * (10 ** uint256(decimals));
        mapping(address => uint256) public balanceOf;
        mapping(address => mapping(address => uint256)) public allowance;

        constructor() {
            balanceOf[msg.sender] = totalSupply;
        }

        event Transfer(address indexed from, address indexed to, uint256 value);
        event Approval(address indexed owner, address indexed spender, uint256 value);

        function transfer(address _to, uint256 _value) public returns (bool success) {
            require(balanceOf[msg.sender] >= _value);
            balanceOf[msg.sender] -= _value;
            balanceOf[_to] += _value;
            emit Transfer(msg.sender, _to, _value);
            return true;
        }

        function approve(address _spender, uint256 _value) public returns (bool success) {
            allowance[msg.sender][_spender] = _value;
            emit Approval(msg.sender, _spender, _value);
            return true;
        }

        function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
            require(_value <= balanceOf[_from]);
            require(_value <= allowance[_from][msg.sender]);
            balanceOf[_from] -= _value;
            balanceOf[_to] += _value;
            allowance[_from][msg.sender] -= _value;
            emit Transfer(_from, _to, _value);
            return true;
        }
    }
    `;
}

function generateVotingContract(rng) {
    const proposalCount = getRandomInt(rng, 5) + 1;
    const proposals = Array.from({ length: proposalCount }, (_, i) => `Proposal${i + 1}`).join(", ");
    const duration = getRandomInt(rng, 30) + 1;

    return `
    pragma solidity ^0.8.0;

    contract Voting {
        struct Proposal {
            string name;
            uint256 voteCount;
        }

        Proposal[] public proposals;
        mapping(address => bool) public hasVoted;
        uint256 public votingDeadline;

        constructor() {
            votingDeadline = block.timestamp + ${duration} days;
            ${proposals.split(", ").map(name => `proposals.push(Proposal("${name}", 0));`).join("\n            ")}
        }

        function vote(uint256 proposal) public {
            require(!hasVoted[msg.sender], "Already voted.");
            require(block.timestamp < votingDeadline, "Voting has ended.");
            require(proposal < proposals.length, "Invalid proposal.");
            proposals[proposal].voteCount += 1;
            hasVoted[msg.sender] = true;
        }

        function winningProposal() public view returns (uint256 winningProposal_) {
            uint256 winningVoteCount = 0;
            for (uint256 p = 0; p < proposals.length; p++) {
                if (proposals[p].voteCount > winningVoteCount) {
                    winningVoteCount = proposals[p].voteCount;
                    winningProposal_ = p;
                }
            }
        }
    }
    `;
}

function generateCrowdfundingContract(rng) {
    const goalAmount = getRandomInt(rng, 1e5) + 1e4;
    const duration = getRandomInt(rng, 30) + 30;
    const beneficiary = getRandomAddress(rng);
    const minContribution = getRandomInt(rng, 1e3) + 1;

    return `
    pragma solidity ^0.8.0;

    contract Crowdfunding {
        address public beneficiary = ${beneficiary};
        uint256 public goalAmount = ${goalAmount};
        uint256 public deadline = block.timestamp + ${duration} days;
        uint256 public amountRaised;
        uint256 public minContribution = ${minContribution};
        mapping(address => uint256) public balanceOf;

        event FundTransfer(address backer, uint256 amount, bool isContribution);

        function contribute() public payable {
            require(block.timestamp < deadline);
            require(msg.value >= minContribution, "Contribution is below the minimum amount.");
            balanceOf[msg.sender] += msg.value;
            amountRaised += msg.value;
            emit FundTransfer(msg.sender, msg.value, true);
        }

        function checkGoalReached() public {
            require(block.timestamp >= deadline);
            if (amountRaised >= goalAmount) {
                payable(beneficiary).transfer(amountRaised);
                emit FundTransfer(beneficiary, amountRaised, false);
            } else {
                for (uint256 i = 0; i < balanceOf.length; i++) {
                    address backer = balanceOf[i];
                    uint256 amount = balanceOf[backer];
                    if (amount > 0) {
                        backer.transfer(amount);
                        balanceOf[backer] = 0;
                        emit FundTransfer(backer, amount, false);
                    }
                }
            }
        }
    }
    `;
}

function generateEscrowContract(rng) {
    const agent = getRandomAddress(rng);
    const releaseCondition = getRandomInt(rng, 2) === 0 ? "time" : "milestone";
    const releaseTime = getRandomInt(rng, 365) + 1;

    return `
    pragma solidity ^0.8.0;

    contract Escrow {
        address public agent = ${agent};
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
            ${releaseCondition === "time" ? `require(block.timestamp >= ${releaseTime} days, "Cannot withdraw before release time.");` : `// Insert milestone check logic here`}
            uint256 payment = deposits[payee];
            deposits[payee] = 0;
            payable(payee).transfer(payment);
        }
    }
    `;
}

function generateRandomContract(rng) {
    const contractGenerators = [
        generateERC20Contract,
        generateVotingContract,
        generateCrowdfundingContract,
        generateEscrowContract
    ];

    const randomIndex = getRandomInt(rng, contractGenerators.length);
    return contractGenerators[randomIndex](rng);
}

function saveContract(contractCode, filename) {
    fs.writeFileSync(filename, contractCode, 'utf8');
}

function createArchive(output, files) {
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    const outputZip = fs.createWriteStream(output);

    return new Promise((resolve, reject) => {
        outputZip.on('close', resolve);
        archive.on('error', reject);

        archive.pipe(outputZip);

        files.forEach(file => {
            archive.file(file, { name: file.split('/').pop() });
        });

        archive.finalize();
    });
}

function validateContract(contractCode) {
    const input = {
        language: 'Solidity',
        sources: {
            'Contract.sol': {
                content: contractCode
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        for (const error of output.errors) {
            if (error.severity === 'error') {
                console.error('Contract validation error:', error);
                return false;
            }
        }
    }

    return true;
}

const seed = process.env.SEED || 'default-seed';
const numberOfContracts = parseInt(process.env.NUM_CONTRACTS, 10) || 10;
const outputZipFile = `/outputs/contracts_${seed}.zip`;
const rng = seedrandom(seed);

if (!fs.existsSync('./contracts')) {
    fs.mkdirSync('./contracts');
}

if (!fs.existsSync('/outputs')) {
    fs.mkdirSync('/outputs');
}

const contractFiles = [];
let validContractsCount = 0;

while (validContractsCount < numberOfContracts) {
    const contractCode = generateRandomContract(rng);
    const filename = `./contracts/${contractCode.match(/contract (\w+)/)[1]}_${validContractsCount}_seed_${seed}.sol`;
    
    if (validateContract(contractCode)) {
        saveContract(contractCode, filename);
        contractFiles.push(filename);
        validContractsCount++;
    } else {
        console.error(`Invalid contract generated and skipped: ${filename}`);
    }
}

createArchive(outputZipFile, contractFiles)
    .then(() => console.log(`Contracts archived in ${outputZipFile}`))
    .catch(err => console.error(`Error creating archive: ${err}`));