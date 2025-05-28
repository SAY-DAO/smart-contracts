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

Each raw metric is first normalized to a 0–100 percentile scale (0 = lowest, 100 = highest). For time-based metrics we invert the percentile so that shorter times give higher difficulty (e.g.  $N(t_x) = 100 - \text{percentile}(t)$ ), whereas price uses the normal percentile (higher price → higher difficulty). A percentile provides insight about where a value lies within a data set by revealing the percentage of data points below or equal to a specific value. This means if a need’s price is at the 90th percentile, it is higher than 90% of recent prices (so very costly).

```math
P(x) = 100 \times \frac{\text{rank}(x) - 1}{N - 1}
```

The overall Difficulty is then the weighted sum of these normalized scores, where $w_x$ are the criterion weights from AHP (see Weighting via AHP section).

```math
\mathrm{Difficulty}
= w_{t_c}\,N(t_c)
+ w_{t_p}\,N(t_p)
+ w_{t_o}\,N(t_o)
+ w_{t_d}\,N(t_d)
+ w_{\text{price}}\,P(\text{price})
```


where $N(x)$ is the normalized (percentile) score for each criterion. A higher difficulty means the need is harder or more resource-intensive to fulfill.


## Example
To illustrate, assume the DAO has decided initial weights: $w_{t_c}$ = 15%, $w_{t_p}$ = 15%, $w_{t_o}$ = 10%, $w_{t_d}$ = 10%, $w_{\text{price}}$ = 50%. 

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

| **Criteria**                  |  **Wt**  | **Medical Kit** | **School Supplies** | **Food Package** | **Clothes** | **Sports Kit** |
| ----------------------------- | :------: | --------------: | ------------------: | ---------------: | ----------: | -------------: |
|  $t_c$        |    15%   |           100.0 |                50.0 |             75.0 |        25.0 |            0.0 |
|  $t_p$           |    15%   |           100.0 |                75.0 |             50.0 |        25.0 |            0.0 |
|  $t_o$             |    10%   |           100.0 |                75.0 |             25.0 |        50.0 |            0.0 |
|  $t_d$         |    10%   |            75.0 |                25.0 |            100.0 |        50.0 |            0.0 |
| Price                         |    50%   |           100.0 |                25.0 |             50.0 |         0.0 |           75.0 |
| **Difficulty Score**          | **100%** |        **97.5** |           **41.25** |        **56.25** |   **17.50** |      **37.50** |


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
After computing Difficulty Score (typically scaled 0–100), new tokens are minted for that need. We denote a base mint factor B (e.g. 2 tokens per difficulty point, as an example set by DAO). Base tokens = B× (Difficulty Score). Then we apply a collaboration multiplier: if n donors contributed to the need, the DAO-minted reward is multiplied by log2 (n + 1). Thus:

$$Tokens = Difficulty × BaseMultiplier × log₂(n + 1)$$

- BaseMultiplier is a DAO-controlled constant (e.g. 2), scaling the raw score to token units. For example, with BaseMultiplier=2, a score of 50 yields $50\times2=100$ tokens before the log factor.
- The $\log_2(n+1)$ term (where $n$ is the number of distinct donors on that need) ensures diminishing returns as more people contribute: doubling donors roughly adds a fixed bonus. This encourages collaboration without unbounded token inflation.

This token formula links difficulty and community effort to rewards. By design it rewards users/community according to their contribution. 


# Role-Based Token Splits
Minted tokens are divided among roles so each part of the process is rewarded predictably. The current split is given in the following table, however these parameters can be updated by the DAO votes:


| **Role**           | **Purpose**                                                     | **Token Share** |
| ------------------ | --------------------------------------------------------------- | --------------- |
| **Social Worker**  | Created the need and verified the child’s requirements          | 20%             |
| **Auditor**        | Reviewed and approved the legitimacy and compliance of the need | 15%             |
| **Purchaser**      | Completed the transaction, ordering the item from a supplier    | 15%             |
| **Virtual Family** | The **Virtual Family pool**, who collaborated on paying for the need                 | 25%             |
| **Relative**          | Mint tokens form the signed needs                    | 25%             |
## Example - Token Split
Let’s say a need scores Difficulty = 65, with 3 donors and BaseMultiplier = 2. Then:

$Tokens Minted=65×2×log₂(3+1)=65×2×2=260$
| **Role**       | **Share %** | **Token Amount** |
| -------------- | ----------: | ---------------: |
| Social Worker  |         20% |      52.0 tokens |
| Auditor        |         15% |      39.0 tokens |
| Purchaser      |         15% |      39.0 tokens |
| Virtual Family |         25% |      65.0 tokens |
| Relative          |         25% |      65.0 tokens |

# Virtual Family Pool Distribution
TBD
---
Thanks! I’ll now prepare a detailed mathematical breakdown of both percentile ranking and Mahalanobis distance for multivariate, skewed role-based performance comparison. This will include:

* Fully derived equations for each method
* Step-by-step numeric examples
* Visual representations (plots, contours)
* Notes on robustness (log/rank transforms, robust estimators like MCD if needed)

I’ll let you know once the full detailed breakdown is ready.


# Multivariate Ranking of Users: Percentile vs Mahalanobis Methods

We compare two approaches to ranking users who have two metrics (tasks completed and cost per task) under skewed distributions.  Percentile ranking is a nonparametric method that converts each metric to a relative score based on its rank among peers.  The Mahalanobis distance is a multivariate metric that measures how far each user’s 2D (tasks,cost) point lies from the group mean, taking account of covariance.  We show formal definitions, derive formulas, give numeric examples, and discuss robustness and interpretation for skewed data.

## 1. Percentile Ranking

**Definition (Percentile).**  Informally, the *p*-th percentile of a dataset is the value below which *p*% of the data fall.  Equivalently, the *percentile rank* of a data point is the percentage of values at or below it.  Formally, for a sample of size *N* with sorted values $X\_{(1)}\le X\_{(2)}\le\cdots\le X\_{(N)}$, one common method (Hyndman–Fan type-8) computes a (possibly fractional) rank $h=(N+1)\times p/100$, and interpolates linearly between $X\_{\lfloor h\rfloor}$ and $X\_{\lceil h\rceil}$.  For example, if \$h=3.5\$, one takes 50% of the way between the 3rd and 4th ordered values.  Equivalently, simpler formulas like  $\text{PercentileRank} = \frac{i-0.5}{N}\times100\%,\quad i=\text{rank index}$
assigns the *i*-th data value a percentile of \$(i-0.5)/N\$, producing percentiles from about $0%\$ up to \$100%\$ (with none exactly $0%\$ or \$100%\$ under this definition).  In any case, the rule ensures the *P*th percentile lies near rank $\tfrac{P}{100}(N+1)$.

**Ties and Interpolation.**  When multiple values tie, one can assign each tied value the same percentile range or take the average rank.  With small samples or many ties, methods like the Harrell–Davis estimator (based on the beta distribution) provide smooth quantile estimates.  In practice, most software uses linear interpolation: if \$h\$ is fractional, set $P_p = X_{(\lfloor h\rfloor)} + (h - \lfloor h\rfloor)\Bigl(X_{(\lfloor h\rfloor+1)} - X_{(\lfloor h\rfloor)}\Bigr).$  For example, if \$X\_{(3)}=50\$ and \$X\_{(4)}=80\$ and \$h=3.5\$, then the 50th percentile would be \$50 + 0.5(80-50)=65\$.  This ensures a unique percentile even for small *N*.

**Numeric Example – Single Metric.**  Suppose six users have tasks completed: $\[10,20,50,80,150,200]\$.  Sorting gives \$X\_{(1)}=10,\dots,X\_{(6)}=200\$.  Applying the percentile formula \$PR\_i = (i-0.5)/6\$ yields percentiles (approximately) $10\to 8.3\%,\;20\to 25\%,\;50\to 41.7\%,\;80\to 58.3\%,\;150\to 75\%,\;200\to 91.7\%.$  Thus the user with 50 tasks is around the 42nd percentile among peers.  (Different percentile conventions may give slightly different numbers, but all agree on relative ordering.)

**Combining Percentiles for Two Metrics.**  To rank on two metrics (e.g. *tasks* and *cost*), first convert each metric separately to a percentile.  Care must be taken with direction: here *more tasks* is better, but *lower cost* is better.  We therefore take the cost percentiles in the *opposite* sense (e.g. define “cost efficiency” = negative cost or use 100 minus the percentile of cost) so that higher percentile = better.  In our example we had tasks percentiles above; for costs $\[300,50,40,100,70,20]\$, sorting ascending gives percentiles \$20\to8.3%,40\to25%,50\to41.7%,70\to58.3%,100\to75%,300\to91.7%\$.  Since low cost is good, we use \$100-\text{cost\_percentile}\$ as a performance score.  Now each user has two percentile scores (one for tasks, one for cost-efficiency).  A simple combined score is the average of these two percentiles.  For instance, using the data above:

| User | Tasks | Cost | Tasks PR (%) | Cost PR (%) | Combined PR = (Tasks+Cost)/2 (%) |
| ---- | ----- | ---- | ------------ | ----------- | -------------------------------- |
| A    | 10    | 300  | 8.3          | 8.3         | 8.3                              |
| B    | 20    | 50   | 25.0         | 58.3        | 41.7                             |
| C    | 50    | 40   | 41.7         | 75.0        | 58.3                             |
| D    | 80    | 100  | 58.3         | 25.0        | 41.7                             |
| E    | 150   | 70   | 75.0         | 41.7        | 58.3                             |
| F    | 200   | 20   | 91.7         | 91.7        | 91.7                             |

Here user F scores highest (91.7%) and A lowest (8.3%) on the combined percentile.  (Note: sums/averages of percentiles implicitly weight each metric equally.  One could also use weighted sums or other aggregates.  Percentile combination treats each metric on a common relative scale, which helps when metrics have different units or skewed ranges.)

**Visualization.**  A percentile-based ranking can be visualized via *percentile bands* or an *empirical CDF*.  For each metric, one can draw a histogram or density of raw scores and mark vertical lines at percentiles of interest, showing how values map to percentile positions.  Alternatively, plotting the empirical cumulative distribution function (ECDF) illustrates the percentile relationship directly: each user’s score maps to the fraction of data below it.  (Because percentiles are rank-based, the method is robust to non-normal or skewed distributions.)

## 2. Mahalanobis Distance

**Definition (Mahalanobis Distance).**  Given a multivariate distribution with mean vector \$\boldsymbol\mu\$ and covariance matrix \$\Sigma\$, the Mahalanobis distance of a point \$\mathbf{x}\$ is defined by
$d_M(\mathbf{x}) = \sqrt{(\mathbf{x}-\boldsymbol\mu)^T\,\Sigma^{-1}\,(\mathbf{x}-\boldsymbol\mu)}\,.$
Equivalently, the squared distance is \$d\_M^2 = (\mathbf{x}-\boldsymbol\mu)^T\Sigma^{-1}(\mathbf{x}-\boldsymbol\mu)\$.  This measures distance after “whitening” the data: if \$\Sigma=S^TS\$ then \$d\_M(\mathbf{x})=|S^{-1}(\mathbf{x}-\boldsymbol\mu)|\$, i.e. the Euclidean norm in transformed space.  Unlike simple Euclidean distance, Mahalanobis accounts for correlations and differing variances in the dimensions.

**Derivation.**  The Mahalanobis formula arises from the multivariate normal distribution and the idea of contours of constant likelihood.  In matrix form, for two 2D points \$\mathbf{x},\mathbf{y}\$, one also has \$d\_M(\mathbf{x},\mathbf{y}) = \sqrt{(\mathbf{x}-\mathbf{y})^T\Sigma^{-1}(\mathbf{x}-\mathbf{y})}\$.  Hence the mean \$\boldsymbol\mu\$ is effectively a “center” of the data and \$\Sigma\$ defines how distance is scaled in each direction.  In particular, level sets of constant \$d\_M\$ are ellipsoids: \${\mathbf{x}: (\mathbf{x}-\boldsymbol\mu)^T\Sigma^{-1}(\mathbf{x}-\boldsymbol\mu)=c^2}\$ are ellipses whose axes align with the eigenvectors of \$\Sigma\$.

“Contours” of Mahalanobis distance can be visualized: for example, Figure 1 (from Tretherington 2021) shows ellipses of equal Mahalanobis-distance probability.  The purple ellipse is based on the sample mean and covariance, whereas cyan/orange show robust versions (MCD/MVE) that focus on dense clusters.

&#x20;*Figure: Elliptical contours of Mahalanobis distance around the sample mean (purple) versus robust estimates (cyan/orange).  Equal-distance contours form ellipsoids determined by the covariance.*

**Numeric Example.**  Using the same 6-user data, let \$\mathbf{x}=(\text{tasks},\text{cost})\$ and compute the sample mean \$\boldsymbol\mu=(85,96.67)\$ and covariance matrix \$\Sigma\$ (with entries in appropriate units).  For each user \$i\$ we compute the Mahalanobis distance \$d\_i = \sqrt{(\mathbf{x}\_i-\boldsymbol\mu)^T\Sigma^{-1}(\mathbf{x}\_i-\boldsymbol\mu)}\$.  For our data one finds (rounded)

| User | Tasks | Cost | \$\mathbf{x}-\boldsymbol\mu\$ | \$d\_M\$ (Mahalanobis) |
| ---- | ----- | ---- | ----------------------------- | ---------------------- |
| A    | 10    | 300  | \$(-75, +203.3)\$             | 1.97                   |
| B    | 20    | 50   | \$(-65, -46.7)\$              | 1.38                   |
| C    | 50    | 40   | \$(-35, -56.7)\$              | 1.05                   |
| D    | 80    | 100  | \$(-5, +3.3)\$                | 0.07                   |
| E    | 150   | 70   | \$(+65, -26.7)\$              | 0.89                   |
| F    | 200   | 20   | \$(+115, -76.7)\$             | 1.52                   |

*(Here \$d\_M\$ is computed with the above mean and covariance.  For instance, user A has \$\mathbf{x}-\boldsymbol\mu=\[-75,;203.3]\$ and \$d\_M\approx1.97\$.)*

From these distances, smaller is “better” (closer to the group center).  In this example the ordering (best to worst) by Mahalanobis distance is D (0.07), E (0.89), C (1.05), B (1.38), F (1.52), A (1.97).  This differs from the percentile-aggregate ranking: for instance, user F (200 tasks, cost 20) was best by percentiles but has a high Mahalanobis distance because its task count is an extreme outlier relative to the covariance structure.

**Robustness and Transformations.**  The usual Mahalanobis distance assumes approximately Gaussian data and uses the sample mean and covariance.  If the data are skewed or have outliers, one can first transform or use robust estimates.  A common step is a *logarithmic transform* on skewed metrics: e.g. work in \$\log(\text{tasks})\$ or \$\log(\text{cost})\$ so that the distribution is more symmetric.  (Indeed, some outlier-detection pipelines apply \$\log\$ because “Mahalanobis’ distance requires symmetrical data, so a log transform is applied”.)  Alternatively, one can replace the raw values by ranks or percentiles (effectively a nonparametric transform to uniform) before computing distances.  After transformation, compute the mean and covariance of the transformed data and apply the Mahalanobis formula.

Another approach is *robust covariance estimation*.  The Minimum Covariance Determinant (MCD) method finds the subset of \$\lfloor(N+N\_{\rm dim}+1)/2\rfloor\$ observations whose covariance has the smallest determinant, and uses that subset to compute a robust mean \$\mu\_r\$ and scatter \$\Sigma\_r\$.  Then one uses \$d\_M(\mathbf{x};\mu\_r,\Sigma\_r)\$ instead of the classical version.  MCD has a high breakdown point and is affine-equivariant.  In practice this yields Mahalanobis distances that are less influenced by outliers in the data.  (Figure 1’s cyan ellipses illustrate MCD-based contours.)

In summary, to robustify Mahalanobis: (1) apply transformations (e.g. log or rank) to reduce skew and bound the data; (2) use a robust estimator like MCD for \$\mu,\Sigma\$; (3) optionally apply a break-point test against a \$\chi^2\$ distribution if using distances for outlier detection.

## 3. Comparison and Recommendations

**Percentile Ranking** is simple, nonparametric, and intuitive: each user gets a score (0–100) per metric.  It automatically handles skewed data (no normality needed) and is robust to outliers in that extreme values simply get near-0% or near-100%.  It works well when only *relative* positions matter.  However, combining metrics by averaging percentiles implicitly assumes equal weights and independence of metrics.  It also loses information about the joint distribution – for example, two users might have the same average percentile but very different trade-offs between tasks and cost.

**Mahalanobis Distance** is fully multivariate: it captures correlations between metrics and measures “outlierness” from the center.  It is appropriate if the data are roughly ellipsoid-shaped and one cares about overall deviation.  In our example, Mahalanobis ranked user F lower than percentile did, because F’s high tasks were unusual relative to others.  Mahalanobis also yields a single continuous score, and distance contours (ellipses) provide a geometric interpretation.  However, it assumes (or is most interpretable for) data that are not extremely skewed; heavy tails can inflate distances.  Robustifying via log transforms or MCD (as above) mitigates this.

**When to use which:**  If the goal is simply to rank by each metric equally and combine them transparently, percentiles (possibly averaged or Pareto-ranked) are a fair, distribution-free choice.  They preserve the idea of “better than *x*% of peers.”  Use them when you want interpretability in percentile terms and have no strong assumption about joint distribution.  If the joint distribution is important (e.g. one is concerned about multidimensional outliers or overall efficiency), and if data are not extremely skewed (or have been transformed), Mahalanobis distance (possibly robustified) can give a more principled multivariate ranking.  In practice, one could even combine approaches: e.g. use percentiles to score each dimension, then compute a Mahalanobis-like distance in the *percentile space* (though note percentiles are not metric), or use Mahalanobis but report percentile ranks of the resulting distances for interpretation.

**Conclusions:**  Percentile rankings provide a simple, robust relative scoring of each metric (0–100 scale) that handles skew by construction.  Mahalanobis distance provides a unified multivariate distance that accounts for covariance.  Both methods can be applied to the same data (as shown above) to yield potentially different rankings.  The choice depends on whether one wants a purely rank-based, nonparametric comparison (percentiles) or a covariance-weighted distance measure (Mahalanobis, robustified if needed).

**References:** Authoritative sources define percentiles and interpolation and explain Mahalanobis distance and robust covariance, while example figures illustrate their behavior.
