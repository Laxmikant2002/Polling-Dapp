// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Vote is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
    bytes32 public constant CANDIDATE_ROLE = keccak256("CANDIDATE_ROLE");
    
    address public electionCommission;
    address public winner;
    string public votingStatus = "Voting has not started";
    uint256 public maxCandidates = 10; // Configurable maximum number of candidates
    uint256 public maxVotingDuration = 7 days; // Configurable maximum voting duration

    event candidate(string _name, string _party, uint _candidateId, address _electionCommission, uint _pollId);
    event voter(string _name, uint _votedTo, address _voterAdd, address _electionCommission, uint _pollId);
    event EcWinner(PollInfo _info, address _electionCommission);
    event VoterRegistered(address voter, uint pollId);
    event FeedbackSubmitted(address voter, string feedback, uint pollId);
    event VotingStarted(uint256 startTime, uint256 endTime);
    event VotingEnded(uint256 pollId);

    struct Voter {
        string name;
        uint256 age;
        uint256 voterId;
        string gender;
        uint256 voteCandidateId;
        address voterAddress;
        uint256 pollID;
        bool isVerified;
    }

    struct Candidate {
        string name;
        string party;
        uint256 age;
        string gender;
        uint256 candidateId;
        address candidateAddress;
        uint256 votes;
        uint256 pollID;
        bool isVerified;
    }

    struct PollInfo {
        uint pollId;
        string winnerName;
        string partyName;
        address winnerAdd;
    }

    uint public nextPollId;
    uint256 nextVoterId = 1;
    uint256 nextCandidateId = 1;
    uint256 public startTime;
    uint256 public endTime;
    mapping(uint256 => mapping(uint => Voter)) voterDetails;
    mapping(uint256 => mapping(uint => Candidate)) candidateDetails;
    mapping(uint256 => mapping(address => bool)) checkVoting;
    mapping(uint256 => mapping(address => uint)) checkVoterId;
    mapping(uint => PollInfo[]) EcPolls;
    mapping(uint256 => mapping(address => bool)) public isCandidateRegistered;
    mapping(uint256 => mapping(address => bool)) public isVoterRegistered;
    bool stopVoting;

    // Add new mappings for role management
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isVoter;
    mapping(address => bool) public isCandidate;

    constructor() {
        _setupRole(msg.sender);
    }

    function _setupRole(address _admin) internal {
        _setupRole(ADMIN_ROLE, _admin);
        _setupRole(VOTER_ROLE, _admin);
        _setupRole(CANDIDATE_ROLE, _admin);
        isAdmin[_admin] = true;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can perform this action");
        _;
    }

    modifier onlyVoter() {
        require(isVoter[msg.sender], "Only verified voters can perform this action");
        _;
    }

    modifier onlyCandidate() {
        require(isCandidate[msg.sender], "Only verified candidates can perform this action");
        _;
    }

    modifier isVotingOver() {
        require(endTime > block.timestamp || stopVoting == true, "Voting is over");
        _;
    }

    modifier votingNotStarted() {
        require(endTime > block.timestamp, "Voting has not started, start a new Voting poll.");
        _;
    }

    modifier onlyCommission {
        require(msg.sender == electionCommission, "Only commission allowed");
        _;
    }

    function EcPollInfo() public view returns (uint, string memory, string memory, address) {
        PollInfo storage poll = EcPolls[nextPollId][0];
        return (poll.pollId, poll.winnerName, poll.partyName, poll.winnerAdd);
    }

    function candidateRegister(string calldata _name, string calldata _party, uint256 _age, string calldata _gender) 
        external 
        votingNotStarted 
        nonReentrant 
    {
        require(!isCandidateRegistered[nextPollId][msg.sender], "You have already registered");
        require(_age >= 18, "You are not eligible to be a candidate");
        require(nextCandidateId <= maxCandidates, "Maximum number of candidates reached");
        
        candidateDetails[nextPollId][nextCandidateId] = Candidate(
            _name, 
            _party, 
            _age, 
            _gender, 
            nextCandidateId, 
            msg.sender, 
            0, 
            nextPollId,
            false
        );
        
        isCandidateRegistered[nextPollId][msg.sender] = true;
        emit candidate(_name, _party, nextCandidateId, electionCommission, nextPollId);
        nextCandidateId++;
    }

    function verifyCandidate(uint256 _candidateId) external onlyAdmin {
        require(_candidateId < nextCandidateId, "Invalid candidate ID");
        candidateDetails[nextPollId][_candidateId].isVerified = true;
        isCandidate[candidateDetails[nextPollId][_candidateId].candidateAddress] = true;
    }

    function candidateList() public view returns (Candidate[] memory) {
        Candidate[] memory arr = new Candidate[](nextCandidateId - 1);
        for (uint256 i = 1; i < nextCandidateId; i++) {
            arr[i - 1] = candidateDetails[nextPollId][i];
        }
        return arr;
    }

    function voterRegister(string calldata _name, uint256 _age, string calldata _gender) 
        external 
        votingNotStarted 
        nonReentrant 
        returns (bool) 
    {
        require(!isVoterRegistered[nextPollId][msg.sender], "You have already registered");
        require(_age >= 18, "You are not eligible to vote");
        
        voterDetails[nextPollId][nextVoterId] = Voter(
            _name, 
            _age, 
            nextVoterId, 
            _gender, 
            0, 
            msg.sender, 
            nextPollId,
            false
        );
        
        isVoterRegistered[nextPollId][msg.sender] = true;
        emit VoterRegistered(msg.sender, nextPollId);
        nextVoterId++;
        return true;
    }

    function verifyVoter(uint256 _voterId) external onlyAdmin {
        require(_voterId < nextVoterId, "Invalid voter ID");
        voterDetails[nextPollId][_voterId].isVerified = true;
        isVoter[voterDetails[nextPollId][_voterId].voterAddress] = true;
    }

    function vote(uint256 _voterId, uint256 _id) 
        external 
        onlyVoter 
        votingNotStarted 
        isVotingOver 
        nonReentrant 
    {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Voting not active");
        require(voterDetails[nextPollId][_voterId].voteCandidateId == 0, "You have already voted");
        require(voterDetails[nextPollId][_voterId].voterAddress == msg.sender, "You are not a voter");
        require(nextCandidateId > 2, "There are no candidates to vote");
        require(_id < nextCandidateId, "Candidate does not exist");
        require(candidateDetails[nextPollId][_id].isVerified, "Candidate is not verified");
        
        voterDetails[nextPollId][_voterId].voteCandidateId = _id;
        checkVoting[nextPollId][msg.sender] = true;
        emit voter(voterDetails[nextPollId][_voterId].name, _id, msg.sender, electionCommission, nextPollId);
        candidateDetails[nextPollId][_id].votes++;
    }

    function result() external onlyCommission {
        require(block.timestamp > endTime || !stopVoting, "Voting still active");
        Candidate[] memory arr = candidateList();
        require(arr.length > 0, "No candidates registered");
        
        uint256 maxVotes = 0;
        uint256 winningCandidateIndex = 0;
        
        for(uint256 i = 0; i < arr.length; i++) {
            if(arr[i].votes > maxVotes) {
                maxVotes = arr[i].votes;
                winningCandidateIndex = i;
            }
        }
        
        require(maxVotes > 0, "No votes cast");
        
        winner = arr[winningCandidateIndex].candidateAddress;
        EcPolls[nextPollId].push(PollInfo(nextPollId, arr[winningCandidateIndex].name, arr[winningCandidateIndex].party, arr[winningCandidateIndex].candidateAddress));
        emit EcWinner(PollInfo(nextPollId, arr[winningCandidateIndex].name, arr[winningCandidateIndex].party, arr[winningCandidateIndex].candidateAddress), electionCommission);
        
        electionCommission = address(0);
        nextVoterId = 1;
        nextCandidateId = 1;
        for (uint i = 1; i < nextCandidateId; i++) {
            delete candidateDetails[nextPollId][i];
        }
        for (uint i = 1; i < nextVoterId; i++) {
            delete voterDetails[nextPollId][i];
        }
        stopVoting = false;
        votingStatus = "Voting has ended";
        emit VotingEnded(nextPollId);
    }

    function emergency() public {
        require(msg.sender == electionCommission, "You are not election commission");
        votingStatus = "Voting is ended";
        stopVoting = false;
        electionCommission = address(0);
        nextVoterId = 1;
        nextCandidateId = 1;
        for (uint i = 1; i < nextCandidateId; i++) {
            delete candidateDetails[nextPollId][i];
        }
        for (uint i = 1; i < nextVoterId; i++) {
            delete voterDetails[nextPollId][i];
        }
    }

    function checkVotedOrNot() public view returns (bool) {
        return checkVoting[nextPollId][msg.sender];
    }

    function checkVoterRegistered() public view returns (bool) {
        for (uint i = 1; i < nextVoterId; i++) {
            if (msg.sender == voterDetails[nextPollId][i].voterAddress) {
                return true;
            }
        }
        return false;
    }

    function checkVoterID() public view returns (uint) {
        if (checkVoterRegistered() == true) {
            return checkVoterId[nextPollId][msg.sender];
        }
        return 0;
    }

    function voteTime(uint256 _startTime, uint256 _duration) external {
        require(stopVoting == false || block.timestamp > endTime || hasRole(ADMIN_ROLE, msg.sender), "Previous voting in progress");
        require(_duration <= maxVotingDuration, "Voting duration exceeds maximum allowed");
        
        startTime = block.timestamp + _startTime;
        endTime = startTime + _duration;
        stopVoting = false;
        nextPollId++;
        
        emit VotingStarted(startTime, endTime);
    }

    function resetElectionCommission() public returns (bool) {
        require(stopVoting == false || block.timestamp > endTime || hasRole(ADMIN_ROLE, msg.sender), "Previous voting in progress");
        electionCommission = address(0);
        stopVoting = false;
        votingStatus = "Voting has ended";
        startTime = 0;
        endTime = 0;
        nextVoterId = 1;
        nextCandidateId = 1;
        for (uint i = 1; i < nextCandidateId; i++) {
            delete candidateDetails[nextPollId][i];
        }
        for (uint i = 1; i < nextVoterId; i++) {
            delete voterDetails[nextPollId][i];
        }
        return true;
    }

    function submitFeedback(string calldata _feedback) external votingNotStarted {
        require(checkVoterRegistered(), "Not a registered voter");
        emit FeedbackSubmitted(msg.sender, _feedback, nextPollId);
    }
}
