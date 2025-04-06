# TWAAOS-SIC: Exam and Colloquium Planning System

## Project Overview

The TWAAOS-SIC (Exam and Colloquium Planning Information System) is a web-based application developed for the Faculty of Electrical Engineering and Computer Science (FIESC) at "Ștefan cel Mare" University of Suceava (USV). This system aims to assist group leaders, professors, secretariat staff, and other stakeholders in planning and scheduling examinations for undergraduate and master's degree courses.

## Purpose

The application is designed to streamline the process of establishing examination dates for undergraduate and master's courses and generating the corresponding schedules. By leveraging web technologies, services, and microservices, TWAAOS-SIC provides an efficient solution for exam planning and management.

## Key Features

### Secretariat Role
- Google authentication with @usm.ro email verification
- Download Excel templates for data entry
- Generate discipline lists from the Orar application
- Upload and manage group leader information
- Configure examination periods for exams and colloquiums
- Generate reports in Excel and PDF formats
- Monitor examination schedule completion status

### Group Leader Role (Coming Soon)
- Authentication with @student.usv.ro email
- View available examination slots
- Propose examination dates
- Coordinate with professors for scheduling

### Professor Role (Coming Soon)
- Authentication with @usm.ro email
- Review and approve proposed examination dates
- Manage personal examination schedule
- Request specific rooms or resources

## Technology Stack

- Frontend: React.js
- State Management: React Hooks
- Styling: CSS
- Authentication: Google Sign-In
- Data Format: JSON, Excel

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/razvanalexuc/frontendtwaaos.git
   ```

2. Navigate to the project directory:
   ```
   cd frontendtwaaos/my-react-app
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

- `/src/components/roles`: Role-specific components (Secretariat, Group Leader, Professor)
- `/src/components/auth`: Authentication components
- `/src/components/common`: Shared UI components

## Contributing

To contribute to this project:

1. Create a feature branch
2. Implement your changes
3. Submit a pull request

## License

This project is developed for educational purposes at "Ștefan cel Mare" University of Suceava.

## Contact

For more information, please contact the Faculty of Electrical Engineering and Computer Science at USV.
