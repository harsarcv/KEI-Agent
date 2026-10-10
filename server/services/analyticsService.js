const pool = require("../config/database");

/* =========================================================
   REVENUE
========================================================= */

const getRevenue = async () => {
  const query = `
    SELECT
      COALESCE(
        SUM(oi.quantity * oi.unit_price),
        0
      ) AS total_revenue
    FROM order_items oi
    JOIN orders o
      ON o.id = oi.order_id
    WHERE o.status = 'completed';
  `;

  const result = await pool.query(query);

  return {
    totalRevenue: Number(
      result.rows[0].total_revenue
    ),
  };
};


/* =========================================================
   REVENUE BY PERIOD
========================================================= */

const getRevenueByPeriod = async ({
  startDate,
  endDate,
} = {}) => {
  const query = `
    SELECT
      COALESCE(
        SUM(oi.quantity * oi.unit_price),
        0
      ) AS revenue
    FROM order_items oi
    JOIN orders o
      ON o.id = oi.order_id
    WHERE o.status = 'completed'
      AND ($1::date IS NULL OR o.order_date >= $1::date)
      AND ($2::date IS NULL OR o.order_date < ($2::date + INTERVAL '1 day'));
  `;

  const result = await pool.query(query, [
    startDate || null,
    endDate || null,
  ]);

  return {
    revenue: Number(
      result.rows[0].revenue
    ),
  };
};

/* =========================================================
   SALES BY PERIOD
========================================================= */

const getSalesByPeriod = async ({
  startDate,
  endDate,
  limit = 20,
} = {}) => {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const query = `
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      c.name AS category_name,

      SUM(
        oi.quantity
      ) AS units_sold,

      SUM(
        oi.quantity * oi.unit_price
      ) AS revenue,

      SUM(
        oi.quantity * oi.unit_cost
      ) AS cost,

      SUM(
        oi.quantity *
        (
          oi.unit_price - oi.unit_cost
        )
      ) AS gross_profit

    FROM order_items oi

    JOIN orders o
      ON o.id = oi.order_id

    JOIN products p
      ON p.id = oi.product_id

    JOIN categories c
      ON c.id = p.category_id

    WHERE o.status = 'completed'

      AND (
        $1::date IS NULL
        OR o.order_date >= $1::date
      )

      AND (
        $2::date IS NULL
        OR o.order_date < (
          $2::date + INTERVAL '1 day'
        )
      )

    GROUP BY
      p.id,
      p.name,
      c.name

    ORDER BY
      units_sold DESC,
      revenue DESC

    LIMIT $3;
  `;

  const result = await pool.query(
    query,
    [
      startDate || null,
      endDate || null,
      safeLimit,
    ]
  );

  return result.rows.map((row) => ({
    productId: Number(
      row.product_id
    ),

    productName:
      row.product_name,

    categoryName:
      row.category_name,

    unitsSold:
      Number(row.units_sold),

    revenue:
      Number(row.revenue),

    cost:
      Number(row.cost),

    grossProfit:
      Number(row.gross_profit),

    profitMargin:
      Number(row.revenue) > 0
        ? Number(
            (
              (
                Number(row.gross_profit) /
                Number(row.revenue)
              ) * 100
            ).toFixed(2)
          )
        : 0,
  }));
};


/* =========================================================
   MONTHLY REVENUE
========================================================= */

const getMonthlyRevenue = async () => {
  const query = `
    SELECT
      TO_CHAR(
        DATE_TRUNC('month', o.order_date),
        'YYYY-MM'
      ) AS month,

      COUNT(DISTINCT o.id) AS total_orders,

      SUM(oi.quantity) AS total_items,

      COALESCE(
        SUM(
          oi.quantity * oi.unit_price
        ),
        0
      ) AS revenue

    FROM order_items oi

    JOIN orders o
      ON o.id = oi.order_id

    WHERE o.status = 'completed'

    GROUP BY DATE_TRUNC(
      'month',
      o.order_date
    )

    ORDER BY DATE_TRUNC(
      'month',
      o.order_date
    );
  `;

  const result = await pool.query(query);

  return result.rows.map((row) => ({
    month: row.month,
    totalOrders: Number(
      row.total_orders
    ),
    totalItems: Number(
      row.total_items
    ),
    revenue: Number(
      row.revenue
    ),
  }));
};


/* =========================================================
   REVENUE TREND
========================================================= */

const getSalesTrend = async () => {
  const query = `
    WITH monthly AS (
      SELECT
        DATE_TRUNC(
          'month',
          o.order_date
        ) AS month,

        SUM(
          oi.quantity * oi.unit_price
        ) AS revenue

      FROM order_items oi

      JOIN orders o
        ON o.id = oi.order_id

      WHERE o.status = 'completed'

      GROUP BY DATE_TRUNC(
        'month',
        o.order_date
      )
    ),

    trend AS (
      SELECT
        month,
        revenue,

        LAG(revenue)
        OVER (
          ORDER BY month
        ) AS previous_revenue

      FROM monthly
    )

    SELECT
      TO_CHAR(
        month,
        'YYYY-MM'
      ) AS month,

      revenue,

      previous_revenue,

      CASE
        WHEN previous_revenue IS NULL
          THEN NULL

        WHEN previous_revenue = 0
          THEN NULL

        ELSE ROUND(
          (
            (
              revenue -
              previous_revenue
            )
            /
            previous_revenue
          ) * 100,
          2
        )
      END AS growth_percentage

    FROM trend

    ORDER BY month;
  `;

  const result = await pool.query(query);

  return result.rows.map((row) => ({
    month: row.month,
    revenue: Number(
      row.revenue
    ),
    previousRevenue:
      row.previous_revenue === null
        ? null
        : Number(
            row.previous_revenue
          ),
    growthPercentage:
      row.growth_percentage === null
        ? null
        : Number(
            row.growth_percentage
          ),
  }));
};


/* =========================================================
   TOP PRODUCTS
========================================================= */

const getTopProducts = async () => {
  const query = `
    SELECT
      p.id AS product_id,
      p.name AS product_name,

      SUM(
        oi.quantity
      ) AS total_quantity,

      SUM(
        oi.quantity * oi.unit_price
      ) AS total_revenue

    FROM order_items oi

    JOIN orders o
      ON o.id = oi.order_id

    JOIN products p
      ON p.id = oi.product_id

    WHERE o.status = 'completed'

    GROUP BY
      p.id,
      p.name

    ORDER BY
      total_quantity DESC

    LIMIT 5;
  `;

  const result = await pool.query(query);

  return result.rows.map((row) => ({
    productId: Number(
      row.product_id
    ),
    productName:
      row.product_name,

    totalQuantity:
      Number(
        row.total_quantity
      ),

    totalRevenue:
      Number(
        row.total_revenue
      ),
  }));
};


/* =========================================================
   PRODUCT PERFORMANCE
========================================================= */

const getProductPerformance = async ({
  limit = 10,
} = {}) => {
  const safeLimit = Math.min(
    Math.max(
      Number(limit) || 10,
      1
    ),
    50
  );

  const query = `
    SELECT
      p.id AS product_id,
      p.name AS product_name,

      c.name AS category_name,

      SUM(
        oi.quantity
      ) AS units_sold,

      SUM(
        oi.quantity *
        oi.unit_price
      ) AS revenue,

      SUM(
        oi.quantity *
        oi.unit_cost
      ) AS cost,

      SUM(
        oi.quantity *
        (
          oi.unit_price -
          oi.unit_cost
        )
      ) AS gross_profit

    FROM order_items oi

    JOIN orders o
      ON o.id = oi.order_id

    JOIN products p
      ON p.id = oi.product_id

    JOIN categories c
      ON c.id = p.category_id

    WHERE o.status = 'completed'

    GROUP BY
      p.id,
      p.name,
      c.name

    ORDER BY
      gross_profit DESC

    LIMIT $1;
  `;

  const result = await pool.query(
    query,
    [safeLimit]
  );

  return result.rows.map((row) => ({
    productId:
      Number(row.product_id),

    productName:
      row.product_name,

    categoryName:
      row.category_name,

    unitsSold:
      Number(row.units_sold),

    revenue:
      Number(row.revenue),

    cost:
      Number(row.cost),

    grossProfit:
      Number(row.gross_profit),

    profitMargin:
      Number(row.revenue) > 0
        ? Number(
            (
              (
                Number(
                  row.gross_profit
                ) /
                Number(
                  row.revenue
                )
              ) * 100
            ).toFixed(2)
          )
        : 0,
  }));
};


/* =========================================================
   TOP CATEGORIES
========================================================= */

const getTopCategories = async () => {
  const query = `
    SELECT
      c.id AS category_id,
      c.name AS category_name,

      SUM(
        oi.quantity *
        oi.unit_price
      ) AS total_revenue

    FROM order_items oi

    JOIN orders o
      ON o.id = oi.order_id

    JOIN products p
      ON p.id = oi.product_id

    JOIN categories c
      ON c.id = p.category_id

    WHERE o.status = 'completed'

    GROUP BY
      c.id,
      c.name

    ORDER BY
      total_revenue DESC

    LIMIT 5;
  `;

  const result = await pool.query(query);

  return result.rows.map((row) => ({
    categoryId:
      Number(row.category_id),

    categoryName:
      row.category_name,

    totalRevenue:
      Number(
        row.total_revenue
      ),
  }));
};


/* =========================================================
   CATEGORY PERFORMANCE
========================================================= */

const getCategoryPerformance = async () => {
  const query = `
    SELECT
      c.id AS category_id,
      c.name AS category_name,

      SUM(
        oi.quantity
      ) AS units_sold,

      SUM(
        oi.quantity *
        oi.unit_price
      ) AS revenue,

      SUM(
        oi.quantity *
        oi.unit_cost
      ) AS cost,

      SUM(
        oi.quantity *
        (
          oi.unit_price -
          oi.unit_cost
        )
      ) AS gross_profit

    FROM order_items oi

    JOIN orders o
      ON o.id = oi.order_id

    JOIN products p
      ON p.id = oi.product_id

    JOIN categories c
      ON c.id = p.category_id

    WHERE o.status = 'completed'

    GROUP BY
      c.id,
      c.name

    ORDER BY
      gross_profit DESC;
  `;

  const result = await pool.query(query);

  return result.rows.map((row) => ({
    categoryId:
      Number(row.category_id),

    categoryName:
      row.category_name,

    unitsSold:
      Number(row.units_sold),

    revenue:
      Number(row.revenue),

    cost:
      Number(row.cost),

    grossProfit:
      Number(row.gross_profit),

    profitMargin:
      Number(row.revenue) > 0
        ? Number(
            (
              (
                Number(
                  row.gross_profit
                ) /
                Number(
                  row.revenue
                )
              ) * 100
            ).toFixed(2)
          )
        : 0,
  }));
};


/* =========================================================
   TOP CUSTOMERS
========================================================= */

const getTopCustomers = async () => {
  const query = `
    SELECT
      c.id AS customer_id,
      c.name AS customer_name,

      COUNT(
        DISTINCT o.id
      ) AS total_orders,

      SUM(
        oi.quantity *
        oi.unit_price
      ) AS total_spending

    FROM order_items oi

    JOIN orders o
      ON o.id = oi.order_id

    JOIN customers c
      ON c.id = o.customer_id

    WHERE o.status = 'completed'

    GROUP BY
      c.id,
      c.name

    ORDER BY
      total_spending DESC

    LIMIT 5;
  `;

  const result = await pool.query(query);

  return result.rows.map((row) => ({
    customerId:
      Number(row.customer_id),

    customerName:
      row.customer_name,

    totalOrders:
      Number(row.total_orders),

    totalSpending:
      Number(row.total_spending),
  }));
};


/* =========================================================
   REPEAT CUSTOMERS
========================================================= */

const getRepeatCustomers = async ({
  limit = 10,
} = {}) => {
  const safeLimit = Math.min(
    Math.max(
      Number(limit) || 10,
      1
    ),
    50
  );

  const query = `
    SELECT
      c.id AS customer_id,
      c.name AS customer_name,

      COUNT(
        DISTINCT o.id
      ) AS total_orders,

      SUM(
        oi.quantity *
        oi.unit_price
      ) AS total_spending

    FROM customers c

    JOIN orders o
      ON o.customer_id = c.id

    JOIN order_items oi
      ON oi.order_id = o.id

    WHERE o.status = 'completed'

    GROUP BY
      c.id,
      c.name

    HAVING COUNT(
      DISTINCT o.id
    ) > 1

    ORDER BY
      total_orders DESC,
      total_spending DESC

    LIMIT $1;
  `;

  const result = await pool.query(
    query,
    [safeLimit]
  );

  return result.rows.map((row) => ({
    customerId:
      Number(row.customer_id),

    customerName:
      row.customer_name,

    totalOrders:
      Number(row.total_orders),

    totalSpending:
      Number(row.total_spending),
  }));
};


/* =========================================================
   PROFIT ANALYSIS
========================================================= */

const getProfitAnalysis = async ({
  startDate,
  endDate,
} = {}) => {
  const query = `
    SELECT

      COALESCE(
        SUM(
          oi.quantity *
          oi.unit_price
        ),
        0
      ) AS revenue,

      COALESCE(
        SUM(
          oi.quantity *
          oi.unit_cost
        ),
        0
      ) AS cost,

      COALESCE(
        SUM(
          oi.quantity *
          (
            oi.unit_price -
            oi.unit_cost
          )
        ),
        0
      ) AS gross_profit

    FROM order_items oi

    JOIN orders o
      ON o.id = oi.order_id

    WHERE o.status = 'completed'

      AND (
        $1::date IS NULL
        OR o.order_date >= $1::date
      )

      AND (
        $2::date IS NULL
        OR o.order_date <
          ($2::date + INTERVAL '1 day')
      );
  `;

  const result = await pool.query(
    query,
    [
      startDate || null,
      endDate || null,
    ]
  );

  const revenue =
    Number(
      result.rows[0].revenue
    );

  const cost =
    Number(
      result.rows[0].cost
    );

  const grossProfit =
    Number(
      result.rows[0].gross_profit
    );

  return {
    revenue,
    cost,
    grossProfit,

    profitMargin:
      revenue > 0
        ? Number(
            (
              (
                grossProfit /
                revenue
              ) * 100
            ).toFixed(2)
          )
        : 0,
  };
};


/* =========================================================
   PERIOD COMPARISON
========================================================= */

const comparePeriods = async ({
  periodAStart,
  periodAEnd,
  periodBStart,
  periodBEnd,
} = {}) => {
  const query = `
    SELECT
      CASE
        WHEN o.order_date >= $1::date
         AND o.order_date <
             ($2::date + INTERVAL '1 day')
          THEN 'A'

        WHEN o.order_date >= $3::date
         AND o.order_date <
             ($4::date + INTERVAL '1 day')
          THEN 'B'
      END AS period,

      COALESCE(
        SUM(
          oi.quantity *
          oi.unit_price
        ),
        0
      ) AS revenue,

      COALESCE(
        SUM(
          oi.quantity *
          (
            oi.unit_price -
            oi.unit_cost
          )
        ),
        0
      ) AS gross_profit,

      COUNT(
        DISTINCT o.id
      ) AS total_orders

    FROM order_items oi

    JOIN orders o
      ON o.id = oi.order_id

    WHERE o.status = 'completed'

      AND (
        (
          o.order_date >= $1::date
          AND o.order_date <
              ($2::date + INTERVAL '1 day')
        )

        OR

        (
          o.order_date >= $3::date
          AND o.order_date <
              ($4::date + INTERVAL '1 day')
        )
      )

    GROUP BY
      CASE
        WHEN o.order_date >= $1::date
         AND o.order_date <
             ($2::date + INTERVAL '1 day')
          THEN 'A'

        WHEN o.order_date >= $3::date
         AND o.order_date <
             ($4::date + INTERVAL '1 day')
          THEN 'B'
      END

    ORDER BY period;
  `;

  const result = await pool.query(
    query,
    [
      periodAStart,
      periodAEnd,
      periodBStart,
      periodBEnd,
    ]
  );

  const periodA =
    result.rows.find(
      (row) => row.period === "A"
    ) || {
      revenue: 0,
      gross_profit: 0,
      total_orders: 0,
    };

  const periodB =
    result.rows.find(
      (row) => row.period === "B"
    ) || {
      revenue: 0,
      gross_profit: 0,
      total_orders: 0,
    };

  const revenueA =
    Number(periodA.revenue);

  const revenueB =
    Number(periodB.revenue);

  const profitA =
    Number(periodA.gross_profit);

  const profitB =
    Number(periodB.gross_profit);

  const ordersA =
    Number(periodA.total_orders);

  const ordersB =
    Number(periodB.total_orders);

  return {
    periodA: {
      revenue: revenueA,
      grossProfit: profitA,
      totalOrders: ordersA,
    },

    periodB: {
      revenue: revenueB,
      grossProfit: profitB,
      totalOrders: ordersB,
    },

    revenueChange:
      revenueB - revenueA,

    revenueGrowthPercentage:
      revenueA > 0
        ? Number(
            (
              (
                (
                  revenueB -
                  revenueA
                ) /
                revenueA
              ) * 100
            ).toFixed(2)
          )
        : null,

    profitChange:
      profitB - profitA,

    profitGrowthPercentage:
      profitA > 0
        ? Number(
            (
              (
                (
                  profitB -
                  profitA
                ) /
                profitA
              ) * 100
            ).toFixed(2)
          )
        : null,

    orderChange:
      ordersB - ordersA,

    orderGrowthPercentage:
      ordersA > 0
        ? Number(
            (
              (
                (
                  ordersB -
                  ordersA
                ) /
                ordersA
              ) * 100
            ).toFixed(2)
          )
        : null,
  };
};


/* =========================================================
   INVENTORY STATUS
========================================================= */

const getInventoryStatus = async ({
  lowStockThreshold = 20,
  limit = 20,
} = {}) => {
  const safeThreshold = Math.max(
    Number(lowStockThreshold) || 20,
    0
  );

  const safeLimit = Math.min(
    Math.max(
      Number(limit) || 20,
      1
    ),
    100
  );

  const query = `
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      c.name AS category_name,
      p.stock,

      COALESCE(
        SUM(
          CASE
            WHEN o.status = 'completed'
              THEN oi.quantity
            ELSE 0
          END
        ),
        0
      ) AS units_sold

    FROM products p

    JOIN categories c
      ON c.id = p.category_id

    LEFT JOIN order_items oi
      ON oi.product_id = p.id

    LEFT JOIN orders o
      ON o.id = oi.order_id

    GROUP BY
      p.id,
      p.name,
      c.name,
      p.stock

    HAVING
      p.stock <= $1

    ORDER BY
      p.stock ASC,
      units_sold DESC

    LIMIT $2;
  `;

  const result = await pool.query(
    query,
    [
      safeThreshold,
      safeLimit,
    ]
  );

  return result.rows.map((row) => ({
    productId:
      Number(row.product_id),

    productName:
      row.product_name,

    categoryName:
      row.category_name,

    stock:
      Number(row.stock),

    unitsSold:
      Number(row.units_sold),

    stockStatus:
      Number(row.stock) === 0
        ? "out_of_stock"
        : "low_stock",
  }));
};


/* =========================================================
   TOTAL PRODUCTS
========================================================= */

const getTotalProducts = async () => {
  const query = `
    SELECT
      COUNT(*) AS total_products
    FROM products;
  `;

  const result =
    await pool.query(query);

  return Number(
    result.rows[0].total_products
  );
};


/* =========================================================
   TOTAL CUSTOMERS
========================================================= */

const getTotalCustomers = async () => {
  const query = `
    SELECT
      COUNT(*) AS total_customers
    FROM customers;
  `;

  const result =
    await pool.query(query);

  return Number(
    result.rows[0].total_customers
  );
};

/* =========================================================
   BOTTOM PRODUCTS
========================================================= */

const getBottomProducts = async ({
  limit = 5,
  startDate,
  endDate,
} = {}) => {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 5, 1),
    50
  );

  const query = `
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      c.name AS category_name,

      COALESCE(
        SUM(
          CASE
            WHEN o.status = 'completed'
             AND ($1::date IS NULL OR o.order_date >= $1::date)
             AND ($2::date IS NULL OR o.order_date < ($2::date + INTERVAL '1 day'))
            THEN oi.quantity
            ELSE 0
          END
        ),
        0
      ) AS units_sold,

      COALESCE(
        SUM(
          CASE
            WHEN o.status = 'completed'
             AND ($1::date IS NULL OR o.order_date >= $1::date)
             AND ($2::date IS NULL OR o.order_date < ($2::date + INTERVAL '1 day'))
            THEN oi.quantity * oi.unit_price
            ELSE 0
          END
        ),
        0
      ) AS revenue

    FROM products p

    JOIN categories c
      ON c.id = p.category_id

    LEFT JOIN order_items oi
      ON oi.product_id = p.id

    LEFT JOIN orders o
      ON o.id = oi.order_id

    GROUP BY
      p.id,
      p.name,
      c.name

    ORDER BY
      units_sold ASC,
      revenue ASC,
      p.name ASC

    LIMIT $3;
  `;

  const result = await pool.query(query, [
    startDate || null,
    endDate || null,
    safeLimit,
  ]);

  return result.rows.map((row) => ({
    productId: Number(row.product_id),
    productName: row.product_name,
    categoryName: row.category_name,
    unitsSold: Number(row.units_sold),
    revenue: Number(row.revenue),
  }));
};


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  getRevenue,
  getRevenueByPeriod,
  getMonthlyRevenue,
  getSalesTrend,

  getTopProducts,
  getBottomProducts,
  getProductPerformance,

  getTopCategories,
  getCategoryPerformance,

  getTopCustomers,
  getRepeatCustomers,

  getProfitAnalysis,
  comparePeriods,

  getInventoryStatus,

  getTotalProducts,
  getTotalCustomers,
};