#  AI MONEY MENTOR  
### ET Gen AI Hackathon 2026  
---

##  Overview

**AI Money Mentor** is an intelligent, agent-driven personal finance platform designed to solve a massive problem:

>  **95% of Indians do not have a financial plan**

Traditional financial advisors are:
- Expensive (₹25,000+/year)
- Accessible only to HNIs

###  Our Solution
An **AI-powered financial mentor** that:
- Works like WhatsApp (simple & accessible)
- Provides **real, personalized financial planning**
- Uses **multi-agent architecture**
- Delivers **actionable insights, not raw data**

---

##  Application Flow (UI/UX)

###  Homepage (Landing Screen)
- Full HD animated background (finance + AI theme)
- Display:

  - Animated gradient text
- CTA Button: **ENTER**

 User cannot proceed without authentication

---

###  Authentication System

####  Registration Page
- Name
- Email
- Password (hashed)
- Stored in DB (PostgreSQL / MySQL)

####  Login Page
- Email + Password validation
- JWT-based authentication
- No access without login

---

###  Dashboard (After Login Only)

User sees:
- Money Health Score
- FIRE Planner
- Tax Wizard
- Portfolio X-Ray
- Life Event Advisor
- Couple Planner

---

##  Core Features

---

###  FIRE Path Planner
Inputs:
- Age
- Income
- Expenses
- Investments
- Retirement Goal

Output:
- Month-by-month SIP plan
- Asset allocation glidepath
- Retirement date prediction
- Insurance gap analysis

 Dynamic updates (real-time recalculation)

---

###  Money Health Score

Score based on 6 dimensions:
1. Emergency Fund
2. Insurance Coverage
3. Investment Diversification
4. Debt Health
5. Tax Efficiency
6. Retirement Readiness

---

###  Tax Wizard

Inputs:
- Salary OR Form 16

Outputs:
- Old vs New regime comparison
- Exact tax calculation
- Missed deductions
- Suggestions:
- ELSS
- NPS
- PPF

 Step-by-step traceable logic

---

###  Life Event Advisor

Handles:
- Marriage
- Bonus
- Inheritance
- Child planning

Outputs:
- Tax-aware decisions
- Goal-based planning

---

###  Couple Planner

- Dual income optimization
- HRA splitting
- Joint SIP strategy
- Combined net worth tracking

---

###  MF Portfolio X-Ray

Inputs:
- CAMS / KFintech statement

Outputs:
- XIRR calculation
- Portfolio reconstruction
- Overlap detection
- Expense ratio analysis
- Rebalancing strategy

---

##  Agentic Architecture

### Multi-Agent System

| Agent | Responsibility |
|------|----------------|
| Input Agent | Collects user financial data |
| Calculation Agent | Performs tax, SIP, XIRR computations |
| Compliance Agent | Applies SEBI/RBI rules |
| Planning Agent | Generates roadmap |
| Explanation Agent | Converts results into human-friendly insights |

---

###  Agent Workflow



---

### Level 1

      +------------------+
      |      User        |
      +--------+---------+
               |
               v
     +---------+----------+
     |  Input Collection  |
     +---------+----------+
               |
               v
 +-------------+-------------+
 | Financial Processing Engine|
 +------+------+-------------+
        |      |
        v      v
 Tax Engine   Investment Engine
        |      |
        +--+---+
           |
           v
  +--------+--------+
  | AI Decision Layer|
  +--------+--------+
           |
           v
  +--------+--------+
  | Final Output UI |
  +-----------------+ 
---

##  Tech Stack

### Frontend
- Next.js (TypeScript)
- Tailwind CSS
- Framer Motion (animations)

### Backend
- Node.js / Express
- PostgreSQL / MySQL

### AI Layer
- Gemini / OpenAI APIs
- Custom Financial Logic Engine

### Authentication
- JWT + Secure Cookies
- Password hashing (bcrypt)

---

##  Compliance & Safety

-  **Disclaimer Required**
  > AI outputs are for informational purposes only  
  > Not a replacement for licensed financial advice

- SEBI & RBI aligned logic
- No direct stock recommendations
- Audit logs maintained

---

##  Edge Case Handling

✔ Old vs New tax regime comparison  
✔ Portfolio overlap detection  
✔ Dynamic recalculation on input change  
✔ Joint finance optimization  

---

##  Evaluation Alignment

| Criteria | Coverage |
|--------|---------|
| Autonomy | Multi-step AI execution |
| Multi-Agent Design | Modular agents |
| Technical Creativity | AI + Finance logic |
| Enterprise Readiness | Auth + Compliance |
| Impact | Financial literacy improvement |

---

##  Deployment

```bash
git clone https://github.com/your-repo/ai-money-mentor
cd ai-money-mentor
npm install
npm run dev
