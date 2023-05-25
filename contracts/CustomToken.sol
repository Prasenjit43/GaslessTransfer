// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract CustomToken is ERC20Permit {
    constructor() ERC20("MY Token", "MTK") ERC20Permit("MY Token") {
        _mint(msg.sender, 1000 * (10 ** 18));
    }
}
