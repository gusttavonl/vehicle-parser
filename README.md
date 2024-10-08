# Vehicle Parser

## Description
Vehicle Parser is a service that fetches and processes vehicle make and type information from an external API (NHTSA API). It first processes a local dataset, then runs background tasks to update from the API. The service exposes GraphQL endpoints to access the data. It includes logging and error handling mechanisms for resilience.

## Requirements
- Docker
- Node.js (for local development)
- Nest.js (for local development)

## Setup

### Running with Docker

1. Build and start the services using Docker Compose:
    ```bash
    docker-compose up --build
    ```
This will start the service, including the database and API. The dataset will be loaded, and API updates will run in the background.

## Running Locally

1. Install dependencies:
    ```bash
    npm install
    ```

2. Set up environment variables in .env:
    ```bash
    GET_MAKES_URL=https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=xml
    GET_VEHICLE_TYPES_URL=https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId
    MONGO_URL=mongodb://localhost:27017/vehicles
    ```
3. Start the service:
    ```bash
    npm run start
    ```

## Usage
- The service exposes GraphQL endpoints:
  - `getAllMakes`:  Returns all vehicle makes and types.
  - `getMake(makeId: String!)`: Returns a specific make by ID.
- To test the GraphQL API, navigate to `http://localhost:3000/graphql` and use the GraphQL playground.

## Tests
To run the tests:
```bash
npm run test
```