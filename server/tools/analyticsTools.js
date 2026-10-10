const {
  getRevenue,
  getRevenueByPeriod,
  getMonthlyRevenue,
  getSalesByPeriod,
  getSalesTrend,
  getBottomProducts,

  getTopProducts,
  getProductPerformance,

  getTopCategories,
  getCategoryPerformance,

  getTopCustomers,
  getRepeatCustomers,

  getProfitAnalysis,
  comparePeriods,

  getInventoryStatus,
} = require("../services/analyticsService");

const {
  searchSimilarDocuments,
} = require("../services/vectorSearchService");


const analyticsTools = {

  /* =====================================================
     REVENUE
  ===================================================== */

  getRevenue: {
    description:
      "Mengambil total revenue RUMLIV dari seluruh transaksi yang berstatus completed.",

    execute: getRevenue,
  },


  getRevenueByPeriod: {
    description:
      "Mengambil total revenue RUMLIV berdasarkan periode tanggal tertentu. Gunakan ketika pengguna menanyakan revenue dalam rentang waktu tertentu.",

    execute: async ({
      startDate,
      endDate,
    }) => {
      return await getRevenueByPeriod({
        startDate,
        endDate,
      });
    },
  },

  getSalesByPeriod: {
    description:
      "Mengambil data penjualan produk RUMLIV berdasarkan periode tanggal tertentu. Gunakan untuk pertanyaan tentang barang yang terjual, produk yang paling banyak terjual, produk berdasarkan periode, jumlah unit terjual, revenue produk, cost, atau gross profit dalam periode tertentu.",

    execute: async ({
      startDate,
      endDate,
      limit = 20,
    } = {}) => {
      return await getSalesByPeriod({
        startDate,
        endDate,
        limit,
      });
    },
  },


  getMonthlyRevenue: {
    description:
      "Mengambil revenue RUMLIV per bulan beserta jumlah order dan jumlah item untuk menganalisis performa bulanan.",

    execute: getMonthlyRevenue,
  },


  getSalesTrend: {
    description:
      "Menganalisis tren revenue RUMLIV per bulan dan menghitung persentase pertumbuhan atau penurunan dibandingkan bulan sebelumnya.",

    execute: getSalesTrend,
  },


  /* =====================================================
     PRODUCTS
  ===================================================== */

  getTopProducts: {
    description:
      "Mengambil 5 produk RUMLIV dengan jumlah unit terjual terbanyak.",

    execute: getTopProducts,
  },

  getBottomProducts: {
    description:
      "Mengambil produk RUMLIV dengan jumlah unit terjual paling sedikit. Gunakan untuk pertanyaan tentang produk yang paling tidak laku, paling sedikit terjual, atau kurang laku.",

    execute: async ({
      limit = 5,
      startDate,
      endDate,
    } = {}) => {
      return await getBottomProducts({
        limit,
        startDate,
        endDate,
      });
    },
  },


  getProductPerformance: {
    description:
      "Mengambil performa produk RUMLIV berdasarkan unit terjual, revenue, cost, gross profit, dan profit margin. Bisa digunakan untuk mencari produk paling menguntungkan.",

    execute: async ({
      limit = 10,
    } = {}) => {
      return await getProductPerformance({
        limit,
      });
    },
  },


  /* =====================================================
     CATEGORIES
  ===================================================== */

  getTopCategories: {
    description:
      "Mengambil 5 kategori RUMLIV dengan revenue terbesar.",

    execute: getTopCategories,
  },


  getCategoryPerformance: {
    description:
      "Mengambil performa seluruh kategori RUMLIV berdasarkan unit terjual, revenue, cost, gross profit, dan profit margin.",

    execute: getCategoryPerformance,
  },


  /* =====================================================
     CUSTOMERS
  ===================================================== */

  getTopCustomers: {
    description:
      "Mengambil 5 customer RUMLIV dengan total pembelian terbesar.",

    execute: getTopCustomers,
  },


  getRepeatCustomers: {
    description:
      "Mengambil customer RUMLIV yang melakukan lebih dari satu transaksi completed. Gunakan untuk menganalisis repeat purchase atau pembelian berulang.",

    execute: async ({
      limit = 10,
    } = {}) => {
      return await getRepeatCustomers({
        limit,
      });
    },
  },


  /* =====================================================
     PROFIT
  ===================================================== */

  getProfitAnalysis: {
    description:
      "Menghitung revenue, cost, gross profit, dan profit margin RUMLIV. Dapat digunakan dengan periode tanggal tertentu.",

    execute: async ({
      startDate,
      endDate,
    } = {}) => {
      return await getProfitAnalysis({
        startDate,
        endDate,
      });
    },
  },


  /* =====================================================
     PERIOD COMPARISON
  ===================================================== */

  comparePeriods: {
    description:
      "Membandingkan performa bisnis RUMLIV antara dua periode berdasarkan revenue, gross profit, jumlah order, serta persentase perubahan.",

    execute: async ({
      periodAStart,
      periodAEnd,
      periodBStart,
      periodBEnd,
    }) => {
      return await comparePeriods({
        periodAStart,
        periodAEnd,
        periodBStart,
        periodBEnd,
      });
    },
  },


  /* =====================================================
     INVENTORY
  ===================================================== */

  getInventoryStatus: {
    description:
      "Mengambil daftar produk RUMLIV dengan stok rendah atau habis. Gunakan untuk menganalisis risiko persediaan.",

    execute: async ({
      lowStockThreshold = 20,
      limit = 20,
    } = {}) => {
      return await getInventoryStatus({
        lowStockThreshold,
        limit,
      });
    },
  },


  /* =====================================================
     KNOWLEDGE BASE / RAG
  ===================================================== */

  searchKnowledgeBase: {
    description:
      "Mencari informasi yang relevan dari knowledge base internal RUMLIV menggunakan semantic vector search. Gunakan untuk pertanyaan tentang kebijakan, prosedur, aturan, atau informasi internal yang tidak terdapat dalam data transaksi.",

    execute: async ({
      query,
    }) => {
      return await searchSimilarDocuments(
        query,
        3
      );
    },
  },
};


module.exports = analyticsTools;