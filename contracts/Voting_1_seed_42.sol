
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
            votingDeadline = block.timestamp + 5 days;
            proposals.push(Proposal("Proposal1", 0));
            proposals.push(Proposal("Proposal2", 0));
            proposals.push(Proposal("Proposal3", 0));
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
    