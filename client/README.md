# KEI — AI Business Intelligence Assistant

KEI is an AI-powered Business Intelligence Assistant designed to help users analyze business performance through natural-language questions. Built around RUMLIV, a sample Home & Living business, KEI integrates generative AI, PostgreSQL analytics, and Retrieval-Augmented Generation (RAG) to provide data-grounded business insights.

## Features

- AI-powered business chat
- Natural-language business queries
- Revenue and sales analysis
- Monthly revenue trends
- Profit and profit margin analysis
- Product performance analysis
- Lowest-selling product identification
- Category performance analysis
- Customer and repeat customer analysis
- Inventory monitoring and low-stock detection
- Business performance comparison across periods
- Internal knowledge base
- Semantic search using vector embeddings
- Retrieval-Augmented Generation (RAG)
- Local Intent Router for recognized business queries
- Streaming AI responses
- JWT-based authentication
- Password hashing
- Input validation and error handling
- PostgreSQL database integration

## Business Analytics

KEI provides business insights across several areas:

### Revenue & Profit

- Total revenue analysis
- Revenue by date range
- Monthly revenue trends
- Gross profit analysis
- Profit margin analysis
- Period-over-period comparison

### Products & Categories

- Top-selling products
- Lowest-selling products
- Product revenue and profit
- Category revenue and performance
- Product sales by period

### Customers

- Top customers
- Repeat customer identification
- Customer purchasing performance

### Inventory

- Low-stock product detection
- Inventory status monitoring
- Configurable low-stock threshold
- Product restocking insights based on inventory data

## Tech Stack

- **React & Vite** — Frontend application
- **JavaScript** — Main application language
- **Node.js & Express.js** — Backend and REST API
- **PostgreSQL** — Relational database
- **Google Gemini API** — Generative AI integration
- **Gemini Embedding API** — Text embedding generation
- **pgvector** — Vector storage and similarity search
- **RAG** — Retrieval-Augmented Generation
- **JWT** — User authentication
- **bcryptjs** — Password hashing
- **Server-Sent Events (SSE)** — Streaming AI responses
- **Git & GitHub** — Version control

## AI Architecture

KEI uses a tool-based architecture to connect AI responses with business data and internal documents.

```text
User Question
      |
      v
Express.js Backend
      |
      v
Local Intent Router
      |
      +---------------------+
      |                     |
      v                     v
Business Analytics     Knowledge Base
      |                     |
      v                     v
PostgreSQL            Embeddings
                            |
                            v
                       pgvector
                            |
                            v
                           RAG
      |                     |
      +----------+----------+
                 |
                 v
           Gemini AI
                 |
                 v
          Streaming Answer
```

Recognized business queries can be routed directly to backend tools instead of requiring an additional AI tool-selection request. Queries that cannot be confidently classified use the Gemini fallback.

## Database

KEI uses PostgreSQL to store business data and application information.

### Business Tables

- Categories
- Employees
- Customers
- Products
- Orders
- Order Items

### Knowledge Base

- Knowledge Documents

The knowledge base stores document content and vector embeddings to support semantic retrieval.

The `Products` table stores product prices, costs, and inventory quantities. Order records and order items support revenue, sales, and profit calculations.

## Project Structure

```text
KEI/
├── client/
│   └── React + Vite frontend
├── server/
│   ├── auth/
│   │   ├── authController.js
│   │   ├── authMiddleware.js
│   │   └── authRoutes.js
│   ├── config/
│   │   ├── database.js
│   │   └── testDatabase.js
│   ├── controllers/
│   ├── middleware/
│   │   └── validateAIRequest.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── toolRoutes.js
│   │   ├── knowledgeRoutes.js
│   │   ├── searchRoutes.js
│   │   └── ragRoutes.js
│   ├── services/
│   │   ├── aiService.js
│   │   ├── analyticsService.js
│   │   ├── promptService.js
│   │   ├── embeddingService.js
│   │   ├── knowledgeService.js
│   │   ├── vectorSearchService.js
│   │   └── ragService.js
│   ├── tools/
│   │   ├── analyticsTools.js
│   │   ├── toolDefinitions.js
│   │   └── toolExecutor.js
│   ├── server.js
│   ├── createUser.js
│   └── package.json
├── database/
├── docs/
├── .gitignore
└── README.md
```

## Installation

### 1. Clone the Repository

```bash
git clone
cd KEI
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure PostgreSQL

Create a PostgreSQL database named:

```text
kei
```

Enable the pgvector extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Run the database schema and seed scripts available in the `database/` directory.

### 4. Configure Environment Variables

Create a `.env` file inside the `server/` directory.

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kei
DB_USER=postgres
DB_PASSWORD=your_postgresql_password

GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secure_jwt_secret
```

Replace the example values with your own local configuration. Never commit the `.env` file to GitHub.

### 5. Run the Backend

From the `server/` directory:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### 6. Run the Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL provided by Vite, typically:

```text
http://localhost:5173
```

## API

KEI uses an Express.js backend to connect the frontend, AI services, analytics tools, and PostgreSQL database.

### Authentication

- User login
- JWT token generation
- Protected API routes
- Role-based authorization where configured

### AI Chat

- `POST /api/ai/chat`
- Natural-language question processing
- Tool execution and AI response streaming
- Conversation history handling

### Analytics

- Revenue analysis
- Sales trend analysis
- Product performance
- Category performance
- Customer analysis
- Profit analysis
- Period comparison
- Inventory status

### Knowledge Base

- `GET /api/knowledge`
- `POST /api/knowledge`
- Document embedding generation
- Vector similarity search
- RAG-based document retrieval

## Security

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API endpoints
- Input validation
- Environment variables for sensitive configuration
- `.env` excluded from Git
- Database constraints for data integrity

## Project Status

**Development / Portfolio Project**

KEI demonstrates the integration of generative AI, business analytics, relational database management, vector search, and natural-language interfaces in a Business Intelligence application.

## Author

**Harsa Archive**

Full-Stack Developer | PostgreSQL & Database | Web, Mobile & 3D

GitHub: https://github.com/harsarcv