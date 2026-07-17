# Personal Finance Tracker (WealthWise)

A complete, production-grade personal finance application with a **React.js** frontend and **Spring Boot** backend. The system ensures complete data isolation so users can only view and manage their own finance data.

## Features

- **Authentication**: JWT Stateless Session authentication with encrypted passwords (BCrypt).
- **Transactions Ledger**: View, filter (by type, category, date-range, description keyword), add, edit, and delete income/expense items with full pagination.
- **Budgeting**: Define monthly category limits, visualize progress bars, and see near-limit/over-limit warnings.
- **Master Data**: Add, modify, and delete custom classifications (Categories) with type matching constraints.
- **Analytics Dashboard**: Dynamic Recharts charts (Category expense distribution pie, Monthly trend bar), remaining targets, and over-budget notices.
- **Reports Exporting**: Download detailed monthly accounting statements in **CSV** or **PDF** format (using OpenPDF).

---

## Folder Structure

```text
personal-finance-tracker/
├── backend/                   # Spring Boot REST service (Maven)
│   ├── src/main/java          # Business logic, controllers, repositories
│   └── src/main/resources     # Application profile configs, seed configurations
├── frontend/                  # React dashboard web app (Vite + Tailwind)
│   ├── src/pages              # Dashboard views (budgets, transactions, reports, etc.)
│   └── src/api                # Axios instance with auth interceptors
├── Personal_Finance_Tracker.postman_collection.json # Postman API collection
└── README.md                  # System setups instructions
```

---

## Backend Setup (Spring Boot)

### Prerequisites
- **Java Development Kit (JDK) 17** or higher
- **Maven** (or use local Maven Wrapper if available)
- **MySQL** database (PostgreSQL is also supported out-of-the-box)

### Database Installation
1. Start your local MySQL service.
2. Create the database:
   ```sql
   CREATE DATABASE personal_finance_tracker;
   ```
3. Set your username and password in the configuration.

### Environment Configuration
Copy `backend/.env.example` into a new file named `backend/.env` and update the database credentials and JWT Secret key:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=personal_finance_tracker
DB_USERNAME=root
DB_PASSWORD=yourpassword
JWT_SECRET=407780517A783272357538782F413F4428472B4B6250655368566D5971337436
```

### Running the Backend
In the `backend/` directory, run:
```bash
mvn clean spring-boot:run
```
The server will start at **http://localhost:8080**.

### API Documentation (Swagger UI)
Once running, check out the Swagger docs at:
- **UI Portal**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **JSON Docs**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## Frontend Setup (React.js)

### Prerequisites
- **Node.js** (v18+) and **npm**

### Environment Configuration
Copy `frontend/.env.example` into a new file named `frontend/.env`:
```env
VITE_API_URL=http://localhost:8080
```

### Installation & Run
In the `frontend/` directory, run:
```bash
npm install
npm run dev
```
The web dashboard will start at **http://localhost:5173** (or **http://localhost:3000** depending on availability).

---

## Sample API Requests & Responses

### 1. User Signup
**POST** `/api/auth/signup`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "createdAt": "2026-07-12T16:45:00"
  }
  ```

### 2. User Login
**POST** `/api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "createdAt": "2026-07-12T16:45:00"
    }
  }
  ```

### 3. Add Transaction
**POST** `/api/transactions`
- **Request Body**:
  ```json
  {
    "type": "EXPENSE",
    "categoryId": 3,
    "amount": 12.50,
    "transactionDate": "2026-07-12",
    "description": "Coffee and donuts"
  }
  ```
- **Response**:
  ```json
  {
    "id": 12,
    "type": "EXPENSE",
    "category": {
      "id": 3,
      "name": "Food",
      "type": "EXPENSE",
      "color": "#EF4444",
      "icon": "Utensils"
    },
    "amount": 12.50,
    "description": "Coffee and donuts",
    "transactionDate": "2026-07-12",
    "createdAt": "2026-07-12T16:50:00",
    "updatedAt": "2026-07-12T16:50:00"
  }
  ```

---

## Seed Data Accounts
The database automatically seeds a mock user for testing if no users are registered on start:
- **Email**: `jane.doe@example.com`
- **Password**: `password123`
*This user is seeded with pre-configured transaction records, category sets, and budgets for the current month.*
