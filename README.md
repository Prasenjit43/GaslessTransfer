# GaslessTransfer
Transfer of tokens from user X to user Y using  user Z account.

# Gasless Token Transfer

This repository contains a Solidity smart contract and JavaScript tests for performing gasless token transfers using permit signatures.

## Smart Contract

The smart contract `CustomToken.sol` is an ERC20 token contract that extends the `ERC20Permit` contract from OpenZeppelin. It allows users to create permit signatures to authorize token transfers on their behalf.

The `GasLessTokenTransfer.sol` contract provides a function `sendTransaction` that performs a gasless token transfer. It takes the following parameters:

- `_token`: The address of the token contract.
- `_owner`: The address of the token owner.
- `_receiver`: The address of the token receiver.
- `_value`: The amount of tokens to transfer.
- `_fee`: The fee amount in tokens.
- `_deadline`: The deadline timestamp for the permit signature.
- `_v`, `_r`, `_s`: The components of the permit signature.

The function first calls the `permit` function of the token contract to authorize the transfer of tokens and fees. Then, it transfers the specified amount of tokens from the owner to the receiver and transfers the fee amount of tokens to the sender of the transaction.

## JavaScript Tests

The JavaScript tests are written using the Mocha testing framework and the Chai assertion library. They verify the functionality of the gasless token transfer using permit signatures.

The tests cover the following scenarios:

1. Deployment of the CustomToken and GasLessTokenTransfer contracts.
2. Transfer of tokens from the contract deployer to Bob, Alice, and Jane.
3. Gasless transfer of tokens from Bob to Alice using a permit signature.

## Running the Tests

To run the tests, follow these steps:

1. Clone the repository:

   ```shell
   git clone https://github.com/your-username/gasless-token-transfer.git
   ```

2. Navigate to the project directory:

   ```shell
   cd gasless-token-transfer
   ```

3. Install the dependencies:

   ```shell
   npm install
   ```

4. Run the tests:

   ```shell
   npx hardhat test
   ```

   This will compile the contracts, deploy them to a local Hardhat network, and run the JavaScript tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
