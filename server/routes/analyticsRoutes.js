const express = require("express");
const {
  getRevenue,
  getTopProducts,
  getTopCategories,
  getTopCustomers,
  getTotalProducts,
  getTotalCustomers,
  getMonthlyRevenue,
} = require("../services/analyticsService");

const {
    authenticateToken,
} = require("../auth/authMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    authenticateToken,
    async (req, res) => {
        try {
            const [
                revenue,
                totalProducts,
                totalCustomers,
                topProducts,
                topCategories,
                topCustomers,
            ] = await Promise.all([
                getRevenue(),
                getTotalProducts(),
                getTotalCustomers(),
                getTopProducts(),
                getTopCategories(),
                getTopCustomers(),
            ]);

            res.json({
                success: true,
                data: {
                    totalRevenue: revenue.totalRevenue,
                    totalProducts,
                    totalCustomers,
                    topProducts,
                    topCategories,
                    topCustomers,
                },
            });
        } catch (error) {
            console.error(
                "Dashboard Analytics Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Gagal mengambil data dashboard",
            });
        }
    }
);

router.get(
  "/monthly-revenue",
  authenticateToken,
  async (req, res) => {
    try {
      const monthlyRevenue = await getMonthlyRevenue();

      res.json({
        success: true,
        data: monthlyRevenue,
      });
    } catch (error) {
      console.error(
        "Monthly Revenue Analytics Error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Gagal mengambil revenue bulanan",
      });
    }
  }
);

module.exports = router;