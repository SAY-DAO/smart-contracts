# Difficulty Score 
Every step from discovering to delivering a need to a child vary widely in complexity and urgency. Our token-reward system quantify each need’s difficulty and reward all participants appropriately. We use the Analytic Hierarchy Process (AHP) to combine multiple difficulty factors into a single score. Delivered needs with higher difficulty generate more tokens, scaled by a DAO‐set multiplier and the number of virtual families involved. All parameters that determine the difficulty score of a need (weights, caps, splits, etc.) are governed by the DAO on-chain to ensure transparency and adaptability.A need’s Difficulty Score is the 0–100 value we compute by combining its five criterion percentiles via the DAO-voted AHP weights.

# Difficulty vs. Urgency
It is important to distinguish difficulty (effort/cost) from urgency (time-criticality). Our scoring model rewards how hard a need is (longer delivery times, higher cost, etc.), not how quickly it must be addressed. For example, an expensive medical kit (high difficulty) might not be urgently needed today, while a cheap item needed immediately is urgent but low difficulty. Our framework uses difficulty solely to allocate tokens (higher tokens for more needs which took more efforts), whereas urgency would be handled by separate rules outside this scoring mechanism.

# DAO-Governed AHP Difficulty Scoring 
SAY DAO members collaboratively determine the importance of each difficulty criterion using the Analytic Hierarchy Process (AHP). SAY DAO integrates community-driven AHP weighting, governance voting, and on-chain reward logic to score contributions and distribute tokens fairly. DAO members not only can propose different proposals but also can vote on every AHP pairwise comparison for difficulty criteria (e.g. completion time vs. procurement time of a delivered need). Each DAO member submits judgments on how criteria compare; these are aggregated into a consensus pairwise matrix. The AHP eigenvector method then computes weights from this DAO-generated matrix, yielding community-defined importance weights for each criterion. 

Each need is scored using five metrics: 
- **Creation→Confirmation time ($t_c$),**
- **Confirmation→Payment time ($t_p $),**
- **Payment→Order time ($t_o $),**
- **Order→Delivery time ($t_d $),**
- **Need Price.**

Each raw metric is first normalized to a 0–100 percentile scale (0 = lowest, 100 = highest). For time-based metrics we invert the percentile so that shorter times give higher difficulty (e.g. $score = 100 - \text{percentile}(t)$), whereas price uses the normal percentile (higher price → higher difficulty). A percentile provides insight about where a value lies within a data set by revealing the percentage of data points below or equal to a specific value. This means if a need’s price is at the 90th percentile, it is higher than 90% of recent prices (so very costly).

Thus we map each raw metric into a 0–100 difficulty subscore. For example, if most needs are delivered in 3–7 days and one took only 1 day, that 1-day case is in a low time percentile (fast), so we invert it to a high difficulty score. Conversely, a very expensive item (e.g. 10th percentile in price) gets a high difficulty score. This puts all metrics on the same 0–100 scale for aggregation.

$$
N(x) = \frac{x - x_{\min}}{x_{\max} - x_{\min}}
$$

The overall Difficulty is then the weighted sum of these normalized scores, where $w_x$ are the criterion weights from AHP (see Weighting via AHP section).

$$
\mathrm{Difficulty} = w_{tc} \cdot N(t_c) + w_{tp} \cdot N(t_p) + w_{to} \cdot N(t_o) + w_{td} \cdot N(t_d) + w_{\text{price}} \cdot N(\text{price})
$$
where $N(x)$ is the normalized (percentile) score for each criterion. A higher difficulty means the need is harder or more resource-intensive to fulfill.


## Example
To illustrate, assume the DAO has decided initial weights: $t_c$ = 15%, $t_p$ = 15%, $t_o$ = 10%, $t_d$ = 10%, $price$ = 50%. 

|     **Need**    | **$t_c$ (days)** | **$t_p$ (days)** | **$t_o$ (days)** | **$t_d$ (days)** | **$Price$ (USD)** |
| :-------------: | --------------: | --------------: | --------------: | --------------: | --------------: |
|   Medical Kit   |               1 |               1 |               1 |               3 |             100 |
| School Supplies |               5 |               5 |               3 |               5 |              40 |
|   Food Package  |               3 |               3 |               7 |               1 |              60 |
|     Clothes     |               7 |               7 |               5 |               4 |              10 |
|    Sports Kit   |               9 |               9 |               9 |               7 |              80 |


**calculation example**: $t_c$ Values sorted ascending: [1, 3, 5, 7, 9]. percentiles(normal) = [0, 25, 50, 75, 100]. inverted = [100, 75, 50, 25, 0].

- 1 day → 100% (Medical Kit)

- 3 days → 75% (Food Package)

- 5 days → 50% (School Supplies)

- 7 days → 25% (Clothes)

- 9 days → 0% (Sports Kit)

| **Criteria**                |  **Wt**  | **Medical Kit** | **School Supplies** | **Food Package** | **Clothes** | **Sports Kit** |
| --------------------------- | :------: | --------------: | ------------------: | ---------------: | ----------: | -------------: |
| Creation→Confirm ($t_c$)     |    15%   |           100.0 |                50.0 |             75.0 |        25.0 |            0.0 |
| Confirm→Payment ($t_p$) |    15%   |           100.0 |                75.0 |             50.0 |        25.0 |            0.0 |
| Payment→Order ($t_o$)        |    10%   |           100.0 |                75.0 |             25.0 |        50.0 |            0.0 |
| Delivery Time ($t_d$)        |    10%   |            75.0 |                25.0 |            100.0 |        50.0 |            0.0 |
| Price                       |    50%   |           100.0 |                25.0 |             50.0 |         0.0 |           75.0 |
| **Difficulty Score**        | **100%** |        **97.5** |           **41.25** |        **56.25** |   **17.50** |      **37.50** |


# Weighting via AHP
 In The analytic hierarchy process (AHP), the decision is structured into a hierarchy of a goal, criteria, and alternatives. Each DAO member submits judgments on every pair of criteria. These pairwise judgments are aggregated into a consensus comparison matrix. The principal eigenvector of this matrix provides a weight for each criterion, yielding community-defined importance levels. This replaces a single-expert weighting scheme with a democratic voting process (one-token-one-vote).

**Why**: The five criteria above may not be equally important (e.g. price might matter more than delivery time). DAO members use AHP’s structured voting to set these weights.

- **Pairwise voting:** DAO participants compare criteria two at a time using Saaty’s 1–9 scale 5 (1 = equal importance, 9 = one extremely more important). For example, a member might judge Price to be “5 times more important” than Order→Delivery time. Each comparison is aggregated (e.g., by geometric mean) into a group pairwise comparison matrix.

- **Compute weights:** We compute the principal eigenvector of the matrix to obtain normalized weights $(w_{\text{tc}}, w_{\text{tp}}, w_{\text{to}}, w_{\text{td}}, w_{\text{price}} )$. This eigenvector reflects the relative importance of each criterion.

- **Consistency check:** AHP quantifies judgment consistency via the Consistency Ratio (CR). A low CR (≤0.10) indicates logical consistency in the decision making. $$ CI = \frac{\lambda_{\max} - n}{n - 1}, \qquad CR = \frac{CI}{RI} $$
  - $\lambda_{\max}$: The principal (largest) eigenvalue of the comparison matrix.
  - $n$: The number of criteria (matrix size, e.g. n=5).
  - $CI$: Consistency index.
  - $RI$: It depends only on n and is obtained from Saaty’s table.


# Token Minting and Allocation
After computing Difficulty Score (typically scaled 0–100), new tokens are minted for that need. We denote a base mint factor B (e.g. 10 tokens per difficulty point, as an example set by DAO). Base tokens = B× (Difficulty Score). Then we apply a collaboration multiplier: if n donors contributed to the need, the DAO-minted reward is multiplied by log2 (n + 1). Thus:

$$Tokens = Difficulty × BaseMultiplier × log₂(n + 1)$$

- BaseMultiplier is a DAO-controlled constant (e.g. 10), scaling the raw score to token units. For example, with BaseMultiplier=10, a score of 50 yields $50\times10=500$ tokens before the log factor.
- The $\log_2(n+1)$ term (where $n$ is the number of distinct donors on that need) ensures diminishing returns as more people contribute: doubling donors roughly adds a fixed bonus. This encourages collaboration without unbounded token inflation.

This token formula links difficulty and community effort to rewards. By design it rewards users/community according to their contribution. 


# Role-Based Token Splits
Minted tokens are divided among roles so each part of the process is rewarded predictably. The fixed split is:


| **Role**           | **Purpose**                                                     | **Token Share** |
| ------------------ | --------------------------------------------------------------- | --------------- |
| **Social Worker**  | Created the need and verified the child’s requirements          | 20%             |
| **Auditor**        | Reviewed and approved the legitimacy and compliance of the need | 15%             |
| **Purchaser**      | Completed the transaction, ordering the item from a supplier    | 15%             |
| **Virtual Family** | The **donor pool** who collaborated on paying for the need                 | 25%             |
| **Relative**          | Mint tokens form the signed needs                    | 25%             |
## Example - Token Split
Let’s say a need scores Difficulty = 65, with 3 donors and BaseMultiplier = 2. Then:

$Tokens Minted=65×2×log2​(3+1)=65×2×2=260$
| **Role**       | **Share %** | **Token Amount** |
| -------------- | ----------: | ---------------: |
| Social Worker  |         20% |      52.0 tokens |
| Auditor        |         15% |      39.0 tokens |
| Purchaser      |         15% |      39.0 tokens |
| Virtual Family |         25% |      65.0 tokens |
| mamad          |         25% |      65.0 tokens |

# Donor Pool Distribution
TBD
