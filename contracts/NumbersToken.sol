// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @dev 'NumbersToken' implementation of the ERC1155 token standard.
 * Allows free minting, burning, 'forging' and trading of tokens.
 */
contract NumbersToken is ERC1155, IERC1155Receiver {
    using Strings for uint256;

    // Token id => Next possible minting timestamp
    mapping(uint256 => uint256) private _cooldowns;

    string public name;

    uint256 public constant ONE = 0;
    uint256 public constant TWO = 1;
    uint256 public constant THREE = 2;
    uint256 public constant FOUR = 3;
    uint256 public constant FIVE = 4;
    uint256 public constant SIX = 5;
    uint256 public constant SEVEN = 6;

    /**
     * @dev Constructor sets `_uri` and `name` and mints one of each token to deployer.
     */
    constructor()
        ERC1155(
            "ipfs://QmatCE4zpiVEHnjQar8c4DUx8quXzDj2YtcycXUawuH6qz/{id}.json"
        )
    {
        name = "Numbers";

        _mint(msg.sender, ONE, 1, "");
        _mint(msg.sender, TWO, 1, "");
        _mint(msg.sender, THREE, 1, "");
        _mint(msg.sender, FOUR, 1, "");
        _mint(msg.sender, FIVE, 1, "");
        _mint(msg.sender, SIX, 1, "");
        _mint(msg.sender, SEVEN, 1, "");
    }

    /**
     * @dev Returns the uri of token `id`.
     *
     * Note that OpenSea requires this implementation of `uri`.
     */
    function uri(uint256 id) public pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "ipfs://QmatCE4zpiVEHnjQar8c4DUx8quXzDj2YtcycXUawuH6qz/",
                    id.toString(),
                    ".json"
                )
            );
    }

    /**
     * @dev Mints 1 token `id` to `msg.sender`.
     *
     * Requirements:
     *
     * - `to` == `msg.sender`
     * - Token `id` is mintable (0, 1, or 2)
     * - Token `id` is not within its cooldown period.
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount
    ) external {
        require(
            id == 0 || id == 1 || id == 2,
            "NumbersToken: Token cannot be minted"
        );
        require(
            amount == 1,
            "NumbersToken: Cannot mint more than one token at a time"
        );
        require(
            _cooldowns[id] <= block.timestamp,
            "NumbersToken: Token in cooldown period"
        );

        _mint(to, id, amount, "");
        _cooldowns[id] = block.timestamp + 1 minutes;
    }

    /**
     * @dev Trades any token `id` for token `idToTradeFor`.
     *
     * Requirements:
     *
     * - Token `idToTradeFor` is tradeable (0, 1, or 2)
     */
    function trade(uint256 id, uint256 idToTradeFor) external {
        require(
            idToTradeFor == 0 || idToTradeFor == 1 || idToTradeFor == 2,
            "NumbersToken: Cannot trade for that token"
        );

        _safeTransferFrom(
            msg.sender,
            address(this),
            id,
            1,
            abi.encode(idToTradeFor)
        );
    }

    /**
     * @dev Allows any `amount` of token `id` to be burned from address `from`.
     */
    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) external {
        _burn(from, id, amount);
    }

    /**
     * @dev Batch implementation of `burn`, allows token's 'forging' feature.
     */
    function burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external {
        _safeBatchTransferFrom(from, address(this), ids, amounts, "");
    }

    /**
     * @dev Mints 1 token specified in `data` to `operator`. Called when contract
     * receieves a token.
     */
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override returns (bytes4) {
        // Get token to trade for from calldata
        _mint(operator, abi.decode(data, (uint256)), 1, "");

        // Return function selector if transfer is allowed
        return this.onERC1155Received.selector;
    }

    /**
     * @dev Mints some amount of 'forged' tokens to `operator`. Token and amount
     * depend on tokens sent.
     */
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external override returns (bytes4) {
        // Determine what to mint based on tokens burned
        (
            uint256 tokenIdToMint,
            uint256 amountToMint
        ) = tokensToMintByTokensBurned(ids, values);

        // Mint tokens to `operator`
        _mint(operator, tokenIdToMint, amountToMint, "");

        // Return function selector if transfer is allowed
        return this.onERC1155BatchReceived.selector;
    }

    /**
     * @dev Returns which token to mint in what amount based on token `ids`
     * and `amounts` burned.
     */
    function tokensToMintByTokensBurned(
        uint256[] memory ids,
        uint256[] memory amounts
    ) private pure returns (uint256, uint256) {
        bool zeroIdFlag;
        uint256 sumOfTokenIds;
        uint256 amountToMint;

        // Check for zero id, sum id's, and calculate amount to mint
        for (uint256 i = 0; i < ids.length; ++i) {
            if (ids[i] == 0) {
                zeroIdFlag = true;
                continue;
            }

            sumOfTokenIds += ids[i];

            // `amountToMint` is the smallest token value burned
            if (amountToMint == 0) {
                amountToMint = amounts[i];
            } else {
                amountToMint = amountToMint < amounts[i]
                    ? amountToMint
                    : amounts[i];
            }
        }

        // Determine what to mint based on sum of token id's
        uint256 tokenIdToMint;

        if (sumOfTokenIds == 1) {
            // ids 0 + 1
            tokenIdToMint = 3;
        } else if (sumOfTokenIds == 2) {
            // ids 0 + 2
            tokenIdToMint = 5;
        } else if (sumOfTokenIds == 3) {
            if (zeroIdFlag) {
                // ids 0 + 1 + 2
                tokenIdToMint = 6;
            } else {
                // ids 1 + 2
                tokenIdToMint = 4;
            }
        }

        return (tokenIdToMint, amountToMint);
    }
}
