// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";

contract GasLessTokenTransfer {
    function sendTransaction(
        address _token,
        address _owner,
        address _receiver,
        uint256 _value,
        uint256 _fee,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) public {
        IERC20Permit(_token).permit(
            _owner,
            address(this),
            _value + _fee,
            _deadline,
            _v,
            _r,
            _s
        );
        IERC20(_token).transferFrom(_owner, _receiver, _value);
        IERC20(_token).transferFrom(_owner, msg.sender, _fee);
    }
}
