# TicketTac - Concert Ticketing System
A scalable SaaS platform designed to handle concert and event ticket management for organizations of all sizes, from small local events to international tours.

## Overview
This microservice-based system provides complete event management, user authentication, and ticket purchasing capabilities with robust error handling and logging. Designed for high performance and reliability, the system ensures secure transactions and proper user notifications.

## Features

- #### Event Management
  - Create, retrieve, update, and delete events
  - Set event capacities and prevent overselling
  - Manage event details, locations, dates, and pricing tiers

- #### User Management
  - User registration and profile management
  - Role-based access control (Admin, EventCreator, Operator, User)
  - Secure password storage and authentication


- #### Ticket Purchasing
  - Secure payment processing
  - Automated ticket generation
  - Asynchronous email/SMS confirmations
  - Ticket verification and validation

## Architecture
The system is built using a microservices architecture with the following components:
- FastAPI Backend: RESTful API services for core business logic
- React Frontend: Responsive user interface
- PostgreSQL: Primary database for persistent storage
- RabbitMQ: Message queue for asynchronous processing
- Mailer Service: Handles email notifications
- Redis: Caching layer
- Load Balancer: Traffic distribution for high availability

## Tech Stack
- Backend: FastAPI (Python)
- Frontend: React.js
- Database: PostgreSQL
- Message Queue: RabbitMQ
- Containerization: Docker
- Orchestration: Kubernetes
- Authentication: JWT

# Contributors
- Lou-Anne Gautherie
- Gabriel Titeux 
