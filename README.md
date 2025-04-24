# Foundation Management System

A comprehensive web application for managing donors, beneficiaries, and interactions for the "Fundación México sin Sordera A.C." (Mexico Without Deafness Foundation).

## Features

- **User Management**
  - Admin and employee roles
  - Secure login with password hashing
  - User profile management

- **Donor Management**
  - Register and track individual and organizational donors
  - Record donations (monetary and in-kind)
  - Track interactions with donors
  - Set follow-up reminders

- **Beneficiary Management**
  - Detailed beneficiary profiles
  - Responsible party tracking
  - Socioeconomic studies
  - Medical information

- **Additional Features**
  - Calendar for scheduling
  - Communication tools
  - Reporting dashboard
  - Google Calendar integration

## Technologies Used

### Backend
- Python with Flask
- MongoDB (Atlas) with PyMongo
- GridFS for file storage
- Flask-Mail for email notifications

### Frontend
- React.js
- React Router for navigation
- React Big Calendar for scheduling
- Custom CSS for styling

## Installation

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MongoDB Atlas account or local MongoDB instance

### Backend Setup
1. Clone the repository
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
