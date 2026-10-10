const formatCurrency = (value) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
};

const Analytics = ({
    analytics,
    analyticsLoading,
    monthlyRevenue,
    monthlyRevenueLoading,
}) => {
    const categories = analytics?.topCategories || [];

    const topCategoryRevenue = Math.max(
        ...categories.map(
            (item) => Number(item.totalRevenue || 0)
        ),
        1
    );

    return (
        <main className="main-content">
            {/* =========================
          TOP BAR
      ========================= */}

            <header className="topbar">
                <div>
                    <p className="eyebrow">RUMLIV BUSINESS</p>
                    <h2>Analytics</h2>
                </div>

                <div className="status">
                    <span className="status-dot"></span>
                    System Online
                </div>
            </header>

            {/* =========================
          ANALYTICS INTRO
      ========================= */}

            <section className="analytics-header">
                <div>
                    <p className="eyebrow">BUSINESS PERFORMANCE</p>

                    <h3>Business Analytics</h3>

                    <p>
                        Analisis performa bisnis RUMLIV berdasarkan
                        data transaksi PostgreSQL.
                    </p>
                </div>

                <span className="section-badge">
                    Live PostgreSQL Data
                </span>
            </section>

            {/* =========================
          KPI
      ========================= */}

            <section className="stats-grid analytics-stats">
                {/* TOTAL REVENUE */}

                <div className="stat-card">
                    <div className="stat-icon revenue">
                        Rp
                    </div>

                    <div>
                        <span>Total Revenue</span>

                        <strong>
                            {analyticsLoading
                                ? "..."
                                : formatCurrency(
                                    analytics?.totalRevenue
                                )}
                        </strong>
                    </div>
                </div>

                {/* TOTAL PRODUCTS */}

                <div className="stat-card">
                    <div className="stat-icon products">
                        ▣
                    </div>

                    <div>
                        <span>Total Produk</span>

                        <strong>
                            {analyticsLoading
                                ? "..."
                                : analytics?.totalProducts ?? 0}
                        </strong>
                    </div>
                </div>

                {/* TOTAL CUSTOMERS */}

                <div className="stat-card">
                    <div className="stat-icon customers">
                        ◉
                    </div>

                    <div>
                        <span>Total Customer</span>

                        <strong>
                            {analyticsLoading
                                ? "..."
                                : analytics?.totalCustomers ?? 0}
                        </strong>
                    </div>
                </div>
            </section>

            {/* =========================
          ANALYTICS CONTENT
      ========================= */}

            {/* =========================
    REVENUE TREND
========================= */}

            <section className="analytics-card analytics-trend-card">
                <div className="section-heading">
                    <div>
                        <span>REVENUE PERFORMANCE</span>
                        <h3>Monthly Revenue</h3>
                    </div>

                    <span className="section-badge">
                        PostgreSQL
                    </span>
                </div>

                {monthlyRevenueLoading ? (
                    <div className="loading-state">
                        Memuat revenue bulanan...
                    </div>
                ) : monthlyRevenue.length === 0 ? (
                    <div className="loading-state">
                        Belum ada data revenue bulanan.
                    </div>
                ) : (
                    <div className="revenue-chart">
                        <div className="revenue-chart-area">
                            {(() => {
                                const chartWidth = 760;
                                const chartHeight = 260;
                                const paddingLeft = 55;
                                const paddingRight = 20;
                                const paddingTop = 20;
                                const paddingBottom = 45;

                                const plotWidth =
                                    chartWidth -
                                    paddingLeft -
                                    paddingRight;

                                const plotHeight =
                                    chartHeight -
                                    paddingTop -
                                    paddingBottom;

                                const maxRevenue = Math.max(
                                    ...monthlyRevenue.map(
                                        (item) => Number(item.revenue || 0)
                                    ),
                                    1
                                );

                                const points = monthlyRevenue.map(
                                    (item, index) => {
                                        const x =
                                            paddingLeft +
                                            (index /
                                                Math.max(
                                                    monthlyRevenue.length - 1,
                                                    1
                                                )) *
                                            plotWidth;

                                        const y =
                                            paddingTop +
                                            plotHeight -
                                            (Number(item.revenue || 0) /
                                                maxRevenue) *
                                            plotHeight;

                                        return {
                                            x,
                                            y,
                                            revenue: Number(
                                                item.revenue || 0
                                            ),
                                            month: item.month,
                                        };
                                    }
                                );

                                const linePath = points
                                    .map(
                                        (point, index) =>
                                            `${index === 0 ? "M" : "L"} ${point.x
                                            } ${point.y}`
                                    )
                                    .join(" ");

                                const areaPath = `
            ${linePath}
            L ${points[points.length - 1].x}
              ${paddingTop + plotHeight}
            L ${points[0].x}
              ${paddingTop + plotHeight}
            Z
          `;

                                return (
                                    <svg
                                        className="revenue-chart-svg"
                                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                        preserveAspectRatio="none"
                                    >
                                        {/* GRID */}

                                        {[0, 0.25, 0.5, 0.75, 1].map(
                                            (ratio) => {
                                                const y =
                                                    paddingTop +
                                                    plotHeight -
                                                    ratio * plotHeight;

                                                return (
                                                    <line
                                                        key={ratio}
                                                        x1={paddingLeft}
                                                        y1={y}
                                                        x2={
                                                            chartWidth -
                                                            paddingRight
                                                        }
                                                        y2={y}
                                                        className="chart-grid-line"
                                                    />
                                                );
                                            }
                                        )}

                                        {/* AREA */}

                                        <path
                                            d={areaPath}
                                            className="revenue-area"
                                        />

                                        {/* LINE */}

                                        <path
                                            d={linePath}
                                            className="revenue-line"
                                            fill="none"
                                        />

                                        {/* POINTS */}

                                        {points.map((point) => (
                                            <g key={point.month}>
                                                <circle
                                                    cx={point.x}
                                                    cy={point.y}
                                                    r="4"
                                                    className="revenue-point"
                                                />

                                                <text
                                                    x={point.x}
                                                    y={
                                                        chartHeight -
                                                        15
                                                    }
                                                    textAnchor="middle"
                                                    className="chart-month"
                                                >
                                                    {point.month.slice(5)}
                                                </text>
                                            </g>
                                        ))}

                                        {/* Y AXIS LABEL */}

                                        <text
                                            x="5"
                                            y={paddingTop + 4}
                                            className="chart-value"
                                        >
                                            {formatCurrency(maxRevenue)}
                                        </text>

                                        <text
                                            x="5"
                                            y={
                                                paddingTop +
                                                plotHeight
                                            }
                                            className="chart-value"
                                        >
                                            Rp 0
                                        </text>
                                    </svg>
                                );
                            })()}
                        </div>

                        <div className="revenue-summary">
                            <div>
                                <span>Periode</span>
                                <strong>
                                    {monthlyRevenue[0]?.month} —{" "}
                                    {
                                        monthlyRevenue[
                                            monthlyRevenue.length - 1
                                        ]?.month
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Total Periode</span>
                                <strong>
                                    {formatCurrency(
                                        monthlyRevenue.reduce(
                                            (total, item) =>
                                                total +
                                                Number(item.revenue || 0),
                                            0
                                        )
                                    )}
                                </strong>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <section className="analytics-grid">

                {/* =========================
            TOP PRODUCTS
        ========================= */}

                <div className="analytics-card">
                    <div className="section-heading">
                        <div>
                            <span>PRODUCT PERFORMANCE</span>

                            <h3>Top Products</h3>
                        </div>

                        <span className="section-badge">
                            PostgreSQL
                        </span>
                    </div>

                    {analyticsLoading ? (
                        <div className="loading-state">
                            Memuat data produk...
                        </div>
                    ) : (
                        <div className="ranking-list">
                            {analytics?.topProducts?.map(
                                (product, index) => (
                                    <div
                                        className="ranking-item"
                                        key={product.productName}
                                    >
                                        <div className="ranking-number">
                                            {index + 1}
                                        </div>

                                        <div className="ranking-info">
                                            <strong>
                                                {product.productName}
                                            </strong>

                                            <span>
                                                {product.totalQuantity} unit
                                                terjual
                                            </span>
                                        </div>

                                        <strong className="ranking-value">
                                            {formatCurrency(
                                                product.totalRevenue
                                            )}
                                        </strong>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* =========================
            TOP CATEGORIES
        ========================= */}

                <div className="analytics-card">
                    <div className="section-heading">
                        <div>
                            <span>CATEGORY PERFORMANCE</span>

                            <h3>Top Categories</h3>
                        </div>

                        <span className="section-badge">
                            PostgreSQL
                        </span>
                    </div>

                    {analyticsLoading ? (
                        <div className="loading-state">
                            Memuat data kategori...
                        </div>
                    ) : (
                        <div className="category-list">
                            {categories.map(
                                (category, index) => {
                                    const revenue = Number(
                                        category.totalRevenue || 0
                                    );

                                    const percentage =
                                        (revenue /
                                            topCategoryRevenue) *
                                        100;

                                    return (
                                        <div
                                            className="category-item"
                                            key={category.categoryName}
                                        >
                                            <div className="category-header">
                                                <div>
                                                    <span className="category-rank">
                                                        {index + 1}
                                                    </span>

                                                    <strong>
                                                        {category.categoryName}
                                                    </strong>
                                                </div>

                                                <strong>
                                                    {formatCurrency(revenue)}
                                                </strong>
                                            </div>

                                            <div className="category-bar">
                                                <div
                                                    className="category-bar-fill"
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>

                {/* =========================
            TOP CUSTOMERS
        ========================= */}

                <div className="analytics-card analytics-card-wide">
                    <div className="section-heading">
                        <div>
                            <span>CUSTOMER PERFORMANCE</span>

                            <h3>Top Customers</h3>
                        </div>

                        <span className="section-badge">
                            PostgreSQL
                        </span>
                    </div>

                    {analyticsLoading ? (
                        <div className="loading-state">
                            Memuat data customer...
                        </div>
                    ) : (
                        <div className="customer-grid">
                            {analytics?.topCustomers?.map(
                                (customer, index) => (
                                    <div
                                        className="customer-item"
                                        key={customer.customerName}
                                    >
                                        <div className="customer-rank">
                                            {index + 1}
                                        </div>

                                        <div className="customer-info">
                                            <strong>
                                                {customer.customerName}
                                            </strong>

                                            <span>
                                                {customer.totalOrders} transaksi
                                            </span>
                                        </div>

                                        <strong className="customer-value">
                                            {formatCurrency(
                                                customer.totalSpending
                                            )}
                                        </strong>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

            </section>
        </main>
    );
};

export default Analytics;