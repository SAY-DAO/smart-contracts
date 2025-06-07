
**Table of Contents**

* [Intro](#intro)
* [Difficulty Score](#difficulty-score)
* [Difficulty vs. Urgency](#difficulty-vs-urgency)
* [DAO-Governed AHP Difficulty Scoring](#dao-governed-ahp-difficulty-scoring)

  * [Example](#example)
* [Weighting via AHP](#weighting-via-ahp)

* [Token Minting and Allocation](#token-minting-and-allocation)

  * [Multiplier Structure](#multiplier-structure)
* [Role-Based Token Splits](#role-based-token-splits)

  * [Example - Token Split](#example---token-split)
* [Virtual Family Pool Distribution](#virtual-family-pool-distribution)

# Intro
In this document, we present a comprehensive, DAO-governed framework for quantifying and rewarding the effort involved in fulfilling “needs” within a tokenized ecosystem. Building upon the analytic hierarchy process (AHP) methodology and sustainability principles originally developed by Kim, Hong, and Majer in their study of [value-driven token economies on blockchain platforms](https://www.mdpi.com/1999-5903/16/5/178), we extend that approach to a broader, need-fulfillment context.

By integrating AHP’s structured decision-making with on-chain governance, our framework not only quantifies effort in a transparent, adaptable manner but also embeds democratic accountability at every stage of token issuance and distribution.
# Difficulty Score 
Every step from discovering to delivering a need to a child vary widely in complexity and urgency. Our token-reward system quantify each need’s difficulty and reward all participants appropriately. We use the Analytic Hierarchy Process (AHP) to combine multiple difficulty factors into a single score. Delivered needs with higher difficulty generate more tokens, scaled by a multiplier and the number of virtual families involved. All parameters that determine the difficulty score of a need (weights, caps, splits, etc.) are governed by the DAO on-chain to ensure transparency and adaptability. A need’s Difficulty Score is the 0–100 value we compute by combining its five criterion percentiles via the DAO-voted AHP weights.

# Difficulty vs. Urgency
It is important to distinguish difficulty (effort-cost) from urgency (time-criticality). Our scoring model rewards how hard a need is (longer delivery times, higher cost, etc.), not how quickly it must be addressed. For example, an expensive medical kit (high difficulty) might not be urgently needed today, while a cheap item needed immediately is urgent but low difficulty. Our framework uses difficulty solely to allocate tokens (higher tokens for more needs which took more efforts), whereas urgency would be handled by separate rules outside this scoring mechanism.

# DAO-Governed AHP Difficulty Scoring 
SAY DAO members collaboratively determine the importance of each difficulty criterion using the Analytic Hierarchy Process (AHP). SAY DAO integrates community-driven AHP weighting, governance voting, and on-chain reward logic to score contributions and distribute tokens fairly. DAO members not only can propose different proposals but also can vote on every AHP pairwise comparison for difficulty criteria (e.g. completion time vs. procurement time of a delivered need). Each DAO member submits judgments on how criteria compare; these are aggregated into a consensus pairwise matrix. The AHP eigenvector method then computes weights from this DAO-generated matrix, yielding community-defined importance weights for each criterion. 

Each need is scored using five metrics: 
- **Creation→Confirmation time ($t_c$),**
- **Confirmation→Payment time ($t_p $),**
- **Payment→Order time ($t_o $),**
- **Order→Delivery time ($t_d $),**
- **Need Price.**

Each raw metric is first normalized to a 0–100 percentile scale (0 = lowest, 100 = highest). For time-based metrics we invert the percentile so that shorter times give higher difficulty (e.g.  the $P_{\mathrm{inv}}(t_c) = 100 - \text{percentile}(t_c)$ ), whereas price uses the normal percentile (higher price → higher difficulty). A percentile provides insight about where a value lies within a data set by revealing the percentage of data points below or equal to a specific value. This means if a need’s price is at the 90th percentile, it is higher than 90% of recent prices (so very costly).

```math
P(x) = 100 \times \frac{\text{rank}(x) - 1}{N - 1}
```

The overall Difficulty is then the weighted sum of these scores, where $w_x$ are the criterion weights from AHP (see Weighting via AHP section).

```math
\mathrm{Difficulty}
= w_{t_c}\,P_{\mathrm{inv}}(t_c)
+ w_{t_p}\,P_{\mathrm{inv}}(t_p)
+ w_{t_o}\,P_{\mathrm{inv}}(t_o)
+ w_{t_d}\,P_{\mathrm{inv}}(t_d)
+ w_{\text{price}}\,P(\text{price})
```


where $P(x)$ and the $P_{\mathrm{inv}}(x)$ are the normalized score for each criterion. A higher difficulty means the need is harder or more resource-intensive to fulfill.


## Example
To illustrate, assume the DAO has decided initial weights: $w_{t_c}$ = 15%, $w_{t_p}$ = 15%, $w_{t_o}$ = 10%, $w_{t_d}$ = 10%, $w_{\text{price}}$ = 50%. N is the total number of items, therefore N = 5.

|     **Need**    | **$t_c$ (days)** | **$t_p$ (days)** | **$t_o$ (days)** | **$t_d$ (days)** | **$Price$ (USD)** |
| :-------------: | --------------: | --------------: | --------------: | --------------: | --------------: |
|   Medical Kit   |               1 |               1 |               1 |               3 |             100 |
| School Supplies |               5 |               5 |               3 |               5 |              40 |
|   Food Package  |               3 |               3 |               7 |               1 |              60 |
|     Clothes     |               7 |               7 |               5 |               4 |              10 |
|    Sports Kit   |               9 |               9 |               9 |               7 |              80 |


**calculation example**: $t_c$ Values sorted ascending: [1, 3, 5, 7, 9]. percentiles(normal) = [0, 25, 50, 75, 100]. inverted = [100, 75, 50, 25, 0].

- 1 day → 100% (Medical Kit) → rank 1

- 3 days → 75% (Food Package) → rank 2

- 5 days → 50% (School Supplies) → rank 3

- 7 days → 25% (Clothes) → rank 4

- 9 days → 0% (Sports Kit) → rank 5

for $t_c$ we get:

| Need | $t_c$ | rank $\mathrm{rank}(t_c)$ | $\mathrm{rank}-1$ | $\displaystyle\frac{\mathrm{rank}-1}{4}$ | $P(t_c)$ |  $P_{\mathrm{inv}}(t_c)$ |
| :-: | :-: | :---------------------: | :---------------: | :--------------------------------------: | :----: | :----: |
|  **Medical Kit**  |  1  |            1            |         0         |               $0/4 = 0.00$               |   0%   |   100%   |
|  **Food Package** |  3  |            2            |         1         |               $1/4 = 0.25$               |   25%  |   75%  |
|  **School Supplies** |  5  |            3            |         2         |               $2/4 = 0.50$               |   50%  |   50%  |
|  **Clothes**  |  7  |            4            |         3         |               $3/4 = 0.75$               |   75%  |   25%  |
| **Sports Kit** |  9  |            5            |         4         |               $4/4 = 1.00$               |  100%  |  0%  |


we do the same for other criteria:

| **Criteria**                  |  **Wt**  | **Medical Kit** | **School Supplies** | **Food Package** | **Clothes** | **Sports Kit** |
| ----------------------------- | :------: | --------------: | ------------------: | ---------------: | ----------: | -------------: |
|  $t_c$        |    15%   |           100.0 |                50.0 |             75.0 |        25.0 |            0.0 |
|  $t_p$           |    15%   |           100.0 |                75.0 |             50.0 |        25.0 |            0.0 |
|  $t_o$             |    10%   |           100.0 |                75.0 |             25.0 |        50.0 |            0.0 |
|  $t_d$         |    10%   |            75.0 |                25.0 |            100.0 |        50.0 |            0.0 |
| Price                         |    50%   |           100.0 |                25.0 |             50.0 |         0.0 |           75.0 |
| **Difficulty Score**          | **100%** |        **97.5** |           **41.25** |        **56.25** |   **17.50** |      **37.50** |

<br><br>
# Weighting via AHP
 In The analytic hierarchy process (AHP), the decision is structured into a hierarchy of a goal, criteria, and alternatives. Each DAO member submits judgments on every pair of criteria. These pairwise judgments are aggregated into a consensus comparison matrix. The principal eigenvector of this matrix provides a weight for each criterion, yielding community-defined importance levels. This replaces a single-expert weighting scheme with a democratic voting process (one-token-one-vote).

**Why**: The five criteria above may not be equally important (e.g. price might matter more than delivery time). DAO members use AHP’s structured voting to set these weights.

- **Pairwise voting:** DAO participants compare criteria two at a time using Saaty’s 1–9 scale (1 = equal importance, 9 = one extremely more important). For example, a member might judge Price to be “5 times more important” than Order→Delivery time. Each comparison is aggregated (e.g., by geometric mean) into a group pairwise comparison matrix.

- **Compute weights:** We compute the principal eigenvector of the matrix to obtain normalized weights $(w_{\text{tc}}, w_{\text{tp}}, w_{\text{to}}, w_{\text{td}}, w_{\text{price}} )$. This eigenvector reflects the relative importance of each criterion.

- **Consistency check:** AHP quantifies judgment consistency via the Consistency Ratio (CR). A low CR (≤0.10) indicates logical consistency in the decision making.

 $$ CI = \frac{\lambda_{\max} - n}{n - 1}, \qquad CR = \frac{CI}{RI} $$
  - $\lambda_{\max}$: The principal (largest) eigenvalue of the comparison matrix.
  - $n$: The number of criteria (matrix size, e.g. n=5).
  - $CI$: Consistency index.
  - $RI$: It depends only on n and is obtained from Saaty’s table.


# Token Minting and Allocation
After computing Difficulty Score (typically scaled 0–100), new tokens are minted for that need. Then we apply a collaboration multiplier which is explained in the Multiplier Structure section.  the DAO-minted reward is multiplied by $log_2 (v + 1)$ where $v$ virtual families contributed to the need,. Thus:

$$Tokens = Difficulty × Multiplier × log_2(v + 1)$$

- Multiplier is a dynamic value caped by the DAO (e.g. 2), which is decided by the performance of the virtual family. For example, with Multiplier=2, a score of 50 yields $50\times2=100$ tokens before the log factor.
- The $\log_2(v+1)$ term ensures diminishing returns as more people contribute. This encourages collaboration without unbounded token inflation.

This token formula links difficulty and community effort to rewards. By design it rewards users/community according to their contribution. The more effective all parties are on delivering a need the more token is mined for that particular need and distributed among them.

### Multiplier Structure
For each virtual family member the system collects two primary metrics **over the last 30 days**:

1. **Total Amount Contributed ($A$)**

   * The sum of money donated by the user in **that role** during the last 30 days.

  $$
    P_A(\text{user}) \;=\; 100 \times \frac{(\text{rank of user by }A) - 1}{M - 1},
  $$


2. **Total count of Needs Funded ($C$)**

   * The number of distinct child needs the user helped fund in **that role** over the last 30 days.

  $$
  P_C(\text{user}) = 100 \times \frac{(\text{rank of user by }C) - 1}{M - 1}
  $$



where $M$ is the total number of active users in that role in last 30 days. Users are sorted ascending by $A$ and $C$. Once we have, $P_A$ and, $P_C$ for a given user—both between 0 and 100, we combine them into a single Performance percentile:

$$
\text{Performance} = \frac{P_A + P_C}{2} \quad(\text{range: }0 \text{–} 100).
$$



An **above-average contributor** is any user whose Performance percentile **exceeds 50** (i.e. strictly greater than the median among all peers in that role). In other words:

* **Above Average** ⇔ $\text{Performance} \gt 50$.
* **At or Below Average** ⇔ $\text{Performance} \le 50$.

By using percentiles, we naturally accommodate skewed distributions—if one aunt contributes $5,000 while most others give $100, she might be at the 99th percentile, and that top-percentile ranking is what matters for boosting rewards.



 1. For any particular need compute each virtual family members' Individual Multiplier, it will be 0 for those below 50% percentile:

$$
\text{Individual Multiplier}_i= \max(0, \frac{Performance_i​−50}{50}) \quad(\text{range: }0 \text{–} 1).
$$

 2. Sum all Individual Multiplier values (only where Performance > 50):

$$
\text{TotalMultiplier} =
\sum_{\substack{i \\ \text{where Performance}_i > 50}} \text{Individual Multiplier}_i
$$

 3. Apply Cap, A DAO-governed cap to prevent excessive inflation.:

$$
\text{FinalMultiplier}= min(1+TotalMultiplier​, Cap)
$$



# Role-Based Token Splits
Minted tokens are divided among roles. Let's assume the current split given in the following table, however these parameters will be set or updated by the DAO votes:


| **Role**           | **Purpose**                                                     | **Token Share** |
| ------------------ | --------------------------------------------------------------- | --------------- |
| **Social Worker**  | Created the need and verified the child’s requirements          | 20%             |
| **Auditor**        | Reviewed and approved the legitimacy and compliance of the need | 15%             |
| **Purchaser**      | Completed the transaction, ordering the item from a supplier    | 15%             |
| **Virtual Family** | The **Virtual Family pool**, who collaborated on paying for the need                 | 25%             |
| **Relative**          | Mint tokens form the signed needs                    | 25%             |
## Example - Token Split
Let’s say a need scores Difficulty = 65, with 3 donors and Multiplier = 2. Then:
<br><br>
$Tokens Minted=65×2×log₂(3+1)=65×2×2=260$
| **Role**       | **Share %** | **Token Amount** |
| -------------- | ----------: | ---------------: |
| Social Worker  |         20% |      52.0 tokens |
| Auditor        |         15% |      39.0 tokens |
| Purchaser      |         15% |      39.0 tokens |
| Virtual Family |         25% |      65.0 tokens |
| Relative       |         25% |      65.0 tokens |

<br><br>

# Virtual Family Pool Distribution

When a child’s need is fulfilled, a relative can mint tokens for that specific need. Contributors within the virtual family pool (e.g., mother, father, aunt, uncle) earn a share of those tokens proportional to their individual payment amounts. In addition, each contributor receives a bonus multiplier based on their **30-day performance percentile** among peers in the same role—for example, a mother’s activity is ranked against all other mothers. Any contributor whose combined performance percentile exceeds the median (i.e., &gt; 50 percentile) increases the reward multiplier for everyone on that need. By benchmarking each role against its own peer group, SAY encourages family members to match or exceed ecosystem norms, ensuring top performers boost collective rewards.
