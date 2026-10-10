const toolDefinitions = [
    {
        type: "function",
        name: "getRevenue",
        description:
            "Mengambil total revenue dari seluruh transaksi yang berstatus completed.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },

    {
        type: "function",
        name: "getSalesByPeriod",
        description:
            "Mengambil data penjualan produk RUMLIV berdasarkan periode tanggal tertentu. Gunakan untuk pertanyaan tentang barang yang terjual, produk yang paling banyak terjual, produk berdasarkan periode, jumlah unit terjual, revenue produk, cost, atau gross profit dalam periode tertentu.",
        parameters: {
            type: "object",
            properties: {
                startDate: {
                    type: "string",
                    description:
                        "Tanggal awal periode dalam format YYYY-MM-DD.",
                },
                endDate: {
                    type: "string",
                    description:
                        "Tanggal akhir periode dalam format YYYY-MM-DD.",
                },
                limit: {
                    type: "integer",
                    description:
                        "Jumlah produk yang ingin dikembalikan. Default 20.",
                    minimum: 1,
                    maximum: 100,
                },
            },
            required: [
                "startDate",
                "endDate",
            ],
        },
    },

    {
        type: "function",
        name: "getRevenueByPeriod",
        description:
            "Mengambil total revenue untuk periode tanggal tertentu. Gunakan untuk pertanyaan tentang revenue pada rentang waktu tertentu.",
        parameters: {
            type: "object",
            properties: {
                startDate: {
                    type: "string",
                    description:
                        "Tanggal awal periode dalam format YYYY-MM-DD.",
                },
                endDate: {
                    type: "string",
                    description:
                        "Tanggal akhir periode dalam format YYYY-MM-DD.",
                },
            },
            required: ["startDate", "endDate"],
        },
    },

    {
        type: "function",
        name: "getMonthlyRevenue",
        description:
            "Mengambil revenue bulanan untuk melihat performa revenue dari waktu ke waktu.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },

    {
        type: "function",
        name: "getSalesTrend",
        description:
            "Mengambil tren penjualan berdasarkan periode bulanan untuk membantu menganalisis kenaikan atau penurunan penjualan.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },

    {
        type: "function",
        name: "getTopProducts",
        description:
            "Mengambil 5 produk dengan jumlah penjualan terbanyak.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },

    {
        type: "function",
        name: "getBottomProducts",
        description:
            "Mengambil produk RUMLIV dengan jumlah unit terjual paling sedikit. Gunakan untuk pertanyaan tentang produk yang paling tidak laku, paling sedikit terjual, atau produk dengan penjualan terendah.",
        parameters: {
            type: "object",
            properties: {
                limit: {
                    type: "integer",
                    description:
                        "Jumlah produk yang ingin dikembalikan. Default 5.",
                    minimum: 1,
                    maximum: 50,
                },
                startDate: {
                    type: "string",
                    description:
                        "Tanggal awal periode dalam format YYYY-MM-DD. Opsional.",
                },
                endDate: {
                    type: "string",
                    description:
                        "Tanggal akhir periode dalam format YYYY-MM-DD. Opsional.",
                },
            },
            required: [],
        },
    },

    {
        type: "function",
        name: "getProductPerformance",
        description:
            "Mengambil performa produk berdasarkan jumlah unit terjual, revenue, cost, profit, dan margin. Gunakan untuk analisis produk secara lebih lengkap.",
        parameters: {
            type: "object",
            properties: {
                limit: {
                    type: "integer",
                    description:
                        "Jumlah produk yang ingin dikembalikan. Default 10.",
                    minimum: 1,
                    maximum: 20,
                },
            },
            required: [],
        },
    },

    {
        type: "function",
        name: "getTopCategories",
        description:
            "Mengambil 5 kategori dengan revenue terbesar.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },

    {
        type: "function",
        name: "getCategoryPerformance",
        description:
            "Mengambil performa setiap kategori berdasarkan unit terjual, revenue, cost, profit, dan margin.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },

    {
        type: "function",
        name: "getTopCustomers",
        description:
            "Mengambil 5 customer dengan total pembelian terbesar.",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        },
    },

    {
        type: "function",
        name: "getRepeatCustomers",
        description:
            "Mengambil customer yang melakukan pembelian lebih dari satu kali. Gunakan untuk menganalisis customer repeat atau loyal.",
        parameters: {
            type: "object",
            properties: {
                limit: {
                    type: "integer",
                    description:
                        "Jumlah customer repeat yang ingin dikembalikan. Default 10.",
                    minimum: 1,
                    maximum: 20,
                },
            },
            required: [],
        },
    },

    {
        type: "function",
        name: "getProfitAnalysis",
        description:
            "Mengambil analisis revenue, cost, gross profit, dan profit margin. Dapat digunakan untuk seluruh periode atau periode tanggal tertentu.",
        parameters: {
            type: "object",
            properties: {
                startDate: {
                    type: "string",
                    description:
                        "Tanggal awal periode dalam format YYYY-MM-DD. Opsional.",
                },
                endDate: {
                    type: "string",
                    description:
                        "Tanggal akhir periode dalam format YYYY-MM-DD. Opsional.",
                },
            },
            required: [],
        },
    },

    {
        type: "function",
        name: "comparePeriods",
        description:
            "Membandingkan performa dua periode berdasarkan revenue, profit, jumlah order, dan perubahan persentase.",
        parameters: {
            type: "object",
            properties: {
                periodAStart: {
                    type: "string",
                    description:
                        "Tanggal awal periode A dalam format YYYY-MM-DD.",
                },
                periodAEnd: {
                    type: "string",
                    description:
                        "Tanggal akhir periode A dalam format YYYY-MM-DD.",
                },
                periodBStart: {
                    type: "string",
                    description:
                        "Tanggal awal periode B dalam format YYYY-MM-DD.",
                },
                periodBEnd: {
                    type: "string",
                    description:
                        "Tanggal akhir periode B dalam format YYYY-MM-DD.",
                },
            },
            required: [
                "periodAStart",
                "periodAEnd",
                "periodBStart",
                "periodBEnd",
            ],
        },
    },

    {
        type: "function",
        name: "getInventoryStatus",
        description:
            "Mengambil status inventory dan produk dengan stok rendah. Gunakan untuk pertanyaan tentang stok, low stock, atau produk yang perlu diperhatikan.",
        parameters: {
            type: "object",
            properties: {
                lowStockThreshold: {
                    type: "integer",
                    description:
                        "Batas stok yang dianggap rendah. Default 20.",
                    minimum: 0,
                    maximum: 1000,
                },
                limit: {
                    type: "integer",
                    description:
                        "Jumlah produk yang ingin dikembalikan. Default 20.",
                    minimum: 1,
                    maximum: 50,
                },
            },
            required: [],
        },
    },

    {
        type: "function",
        name: "searchKnowledgeBase",
        description:
            "Mencari informasi yang relevan dari knowledge base RUMLIV. Gunakan tool ini untuk pertanyaan tentang kebijakan, prosedur, aturan, atau informasi dokumentasi RUMLIV.",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description:
                        "Pertanyaan atau informasi yang ingin dicari.",
                },
            },
            required: ["query"],
        },
    },
];

module.exports = toolDefinitions;