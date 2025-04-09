# TWAAOS-SIC: Exam and Colloquium Planning System

## Project Overview

The TWAAOS-SIC (Exam and Colloquium Planning Information System) is a web-based application developed for the Faculty of Electrical Engineering and Computer Science (FIESC) at "Ștefan cel Mare" University of Suceava (USV). This system aims to assist group leaders, professors, secretariat staff, and other stakeholders in planning and scheduling examinations for undergraduate and master's degree courses.

![TWAAOS-SIC Interface](https://i.imgur.com/iW4LPnM.png)


## Purpose

The application is designed to streamline the process of establishing examination dates for undergraduate and master's courses and generating the corresponding schedules. By leveraging web technologies, services, and microservices, TWAAOS-SIC provides an efficient solution for exam planning and management.

## Key Features

### User Interface
- Modern, responsive design with intuitive navigation
- Animated transitions and interactive elements
- Role-based dashboard cards with visual indicators
- Integration with USV branding and direct links to university website
- Adaptive layout for various screen sizes
- Consistent color scheme based on USV's visual identity

### Secretariat Role
- Google authentication with @usm.ro email verification
- Download Excel templates for data entry
- Generate discipline lists from the Orar application
- Upload and manage group leader information
- Configure examination periods for exams and colloquiums
- Generate reports in Excel and PDF formats
- Monitor examination schedule completion status

### Group Leader Role
- Authentication with @student.usv.ro email
- View available examination slots
- Propose examination dates
- Coordinate with professors for scheduling
- Receive notifications about proposal status

### Professor Role
- Authentication with @usm.ro email
- Review and approve proposed examination dates
- Manage personal examination schedule
- Request specific rooms or resources
- Configure examination details and requirements

## Technology Stack

- Frontend: React.js
- State Management: React Hooks
- Styling: CSS with modern animations and transitions
- UI Design: Responsive design with modern UI/UX principles
- Authentication: Google Sign-In
- Data Format: JSON, Excel
- Fonts: Google Fonts (Roboto, Poppins)
- Icons: Emoji icons and custom styling

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
- `/src/App.js`: Main application component with role selection interface
- `/src/App.css`: Global styling with animations and responsive design

## Recent Updates

### UI Improvements (April 2025)
- Added modern animations and transitions throughout the application
- Implemented responsive design for all screen sizes
- Created interactive role selection cards on the homepage
- Added direct links to USV website (usv.ro)
- Improved header and footer with university branding
- Implemented fade-in animations for a more polished user experience
- Added visual feedback for interactive elements
- Integrated Google Fonts (Roboto, Poppins) for improved typography
- Created a consistent color scheme based on USV's visual identity
- Added hover effects for all interactive elements
- Implemented grid layout for better content organization

### Role Implementation (April 2025)
- Completed Group Leader role implementation with proposal functionality
- Completed Professor role implementation with approval workflow
- Integrated authentication mechanisms for different user roles
- Added role-specific dashboards with tailored functionality
- Implemented Google Sign-In for SEC and CD roles with @usm.ro email verification
- Implemented Google Sign-In for SG role with @student.usv.ro email verification
- Created username/password authentication for Administrator role
- Added secure role-based access control throughout the application

## Future Improvements

### Backend Integration
- Connect frontend with backend services
- Implement API integration with university's timetable system
- Develop real-time notification system for status updates
- Enhance data synchronization between different roles
- Implement caching mechanisms for improved performance

## Contributing

To contribute to this project:

1. Create a feature branch
2. Implement your changes
3. Submit a pull request

## License

This project is developed for educational purposes at "Ștefan cel Mare" University of Suceava.

## Contact

For more information, please contact the Faculty of Electrical Engineering and Computer Science at USV.
