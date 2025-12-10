# mj-cleaning-services
### Contributers
* Jacob White (~3 hours a day over 3 weeks)
  * Manager Dashboard
  * Relevant backend configuration and database design
  * UI Design (website architecture/pop-up modals)
* Minghao Wang (~3 hours a day over 3 weeks)
  * Client Dashboard
  * Relevant backend configuration and database design
  * UX Design (clean modern user friendly design)

## Setup and Installation Guide
This is a full-stack project built to represent data modeling capability.
Project built using these technologies:
* React (frontend)
* Node.js + Express (backend)
* MySQL (database)

## Database Setup (XAMPP)

1. Start Apache and MySQL from the XAMPP Control Panel.
2. Open a terminal in this project folder.
3. Open http://localhost/phpmyadmin/ in your browser.
4. Select 'Import' at the top menu, choose one of the following SQL files:
   - `database.sql` - Basic database structure only (empty tables)
   - `mj_cleaning_services.sql` - Complete database with test data (recommended for testing)
5. Click 'Go' and the database and tables will be created.

> **Note:** Use `mj_cleaning_services.sql` if you want pre-populated test data including sample clients, service requests, and transaction records.

## Web Application Setup

### 1. Clone the Repository
```
git clone https://github.com/whitestjake/mj-cleaning-services.git
cd mj-cleaning-services
```

### 2. Backend Setup

> **Note:** Make sure you have completed the Database Setup (XAMPP) section above before proceeding.

#### 2.1 Navigate to backend folder
```
cd backend
```

#### 2.2 Install dependencies
```
npm install
```

#### 2.3 Create ```database.env```
Inside the backend folder, create a file named **database.env**
Our database.env looks like this, make sure your configuration is proper
```
PORT=5000
BASE_URL=http://localhost:5000

DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mj_cleaning_services
DB_USER=root
DB_PASSWORD=

JWT_SECRET=your_secret_key_here_change_in_production
```
#### 2.4 Start the backend
```
npm start
```
Unless you manually adjusted this, it should indicate the backend is listening on port ```5000```

#### 2.5 Create an Admin Account
To access the manager dashboard, you need to create an admin account. In a new terminal window (while the backend is still running):
```
cd backend
node create-admin.js
```
Follow the prompts to enter:
* Admin username
* Admin email (optional)
* Admin password

You can use these credentials to log in to the manager dashboard at ```http://localhost:3000/```

### 3. Frontend Setup (React)

#### 3.1 Navigate to frontend (on a seperate terminal)
From your root file: ```/mj-cleaning-services```
```
cd frontend
```

#### 3.2 Install dependencies
```
npm install
```

#### 3.3 Start the React web application
```
npm start
```
The application starts at ```http://localhost:3000/```

















