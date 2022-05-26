# GroupBuy

GroupBuy solves some of the coordination and game-theoretic ordering problems of making a collective purchase.
A GroupBuy event has a target ETH amount, and a deadline.

1) Contribute any amount of ETH to the GroupBuy.
2) If it fails to meet the target, reclaim your ETH.
3) If it succeeds, a market buy goes through, and you come back and claim your portion of the tokens. 

All participants get the same basis price.
The 2 separate Contribute + Claim steps actually cost less gas than a direct buy, so it's slightly advantageous for smaller buyers.

```
npx hardhat test
npx hardhat run --network ropsten scripts/deploy.js 
```