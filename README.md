# Solidity Contract Generator

This containerised Lilypad module generates random Solidity contracts and validates them using the Solidity compiler (`solc`). Only validated contracts are included in the final ZIP archive output. If a generated contract contains errors, it is discarded and a new one is generated until the requested number of valid contracts is achieved.

## Prerequisites

Before running the script, ensure you have the following installed:

- Node.js
- Docker

## Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/your-repo/solidity-contract-generator.git
cd solidity-contract-generator
npm install
```

## Running the Script

You can run the script directly from the command line or within a Docker container. 

### Command Line

Set the environment variables and run the script:

```bash
# Set the environment variables and run the script
SEED=42 NUM_CONTRACTS=20 node generate.js
```

### Docker

Build the Docker image:

```bash
docker build -t solidity-generator .
```

Run the container with the required environment variables:

```bash
# Run the container with environment variables
docker run --rm -v $(pwd)/contracts:/usr/src/app/contracts -e SEED=myseed -e NUM_CONTRACTS=20 solidity-generator
```

## Environment Variables

- `SEED`: The seed used for the random number generator. This ensures reproducibility of the generated contracts.
- `NUM_CONTRACTS`: The number of valid contracts to generate.

## Output
The script creates a ZIP archive named `contracts_<seed>.zip` containing all valid generated contracts.

