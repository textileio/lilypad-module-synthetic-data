# Solidity Contract Generator

This containerised Lilypad module generates random Solidity contracts and validates them using the Solidity compiler (`solc`). Only validated contracts are included in the final ZIP archive output. If a generated contract contains errors, it is discarded and a new one is generated until the requested number of valid contracts is achieved.

## Running on Lilypad

First, make sure the [Lilypad CLI](https://docs.lilypad.tech/lilypad/resources/older-versions/lilypad-v1-deprecated/reference/quick-start/install-run-requirements) is installed:

```
curl -sSL -O https://raw.githubusercontent.com/bacalhau-project/lilypad-modicum/main/lilypad && sudo install lilypad /usr/local/bin/lilypad
```

To run on Lilypad via the CLI:

```
lilypad run github.com/Lilypad-Tech/lilypad-module-synthetic-data:0.0.1 \
--params Contracts=10 \
--params Seed=42
```

## Running the Script

You can run the script directly from the command line or within a Docker container.

### Command Line

Set the environment variables and run the script:

```bash
SEED=42 NUM_CONTRACTS=5 node generate.js
```

### Docker

Build the Docker image:

```bash
docker build -t solidity-generator .
```

Run the container with the required environment variables and a mapped `outputs` directory:

```bash
docker run -e SEED=42 -e NUM_CONTRACTS=5 -v $(pwd)/outputs:/outputs solidity-generator
```

## Environment Variables

- `SEED`: The seed used for the random number generator. This ensures reproducibility of the generated contracts.
- `NUM_CONTRACTS`: The number of valid contracts to generate.

## Output

The script creates a ZIP archive named `contracts_<seed>.zip` containing only valid generated contracts that have been validated using the `solc` library.
