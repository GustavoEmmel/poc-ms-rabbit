
# Microservice Architecture with RabbitMQ and API Gateway

This project demonstrates a simple microservice architecture where:
- An **API Gateway** handles RESTful requests and routes them to services via RabbitMQ using RPC (Remote Procedure Call).
- Two microservices (`service-one` and `service-two`) process the requests and respond through RabbitMQ.
- Communication between the API Gateway and services follows a consistent pattern, enabling dynamic routing and reusability.

---

## Architecture Overview

### Components:
1. **API Gateway**:
   - Exposes REST endpoints to clients.
   - Routes requests to the appropriate service and controller based on the URL and HTTP verb.
   - Waits for a response via a temporary RabbitMQ queue for synchronous RPC communication.

2. **Services**:
   - Each service is responsible for specific business logic.
   - Contains multiple controllers, each implementing common CRUD operations (`getById`, `getAll`, `post`, `put`, and `delete`).

3. **RabbitMQ**:
   - Handles message passing between the API Gateway and services.
   - Temporary queues are used for synchronous communication (RPC).

### Routing Pattern
- URL format:  
  ```
  http://localhost:3000/api/{service-name}/{controller-name}/{id?}
  ```
- HTTP verbs map to actions:
  - `GET`: `getByIdAction` (if `id` exists) or `getAllAction`.
  - `POST`: `postAction`.
  - `PUT`: `putAction`.
  - `DELETE`: `deleteAction`.

---

## Project Structure

```
.
├── api-gateway/
│   └── index.js
├── lib/
│   └── rabbitmq-helper.js
├── service-one/
│   ├── index.js
│   └── exampleController.js
├── service-two/
│   ├── index.js
│   └── anotherController.js
└── package.json
```

### Key Files:
- `api-gateway/index.js`: Handles incoming HTTP requests and forwards them to services via RabbitMQ.
- `lib/rabbitmq-helper.js`: A helper library for synchronous (RPC) and asynchronous messaging.
- `service-one/` and `service-two/`: Each service contains an entry file (`index.js`) and controllers.

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Spin up a RabbitMQ docker instance :
   ```bash
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
   ```

3. Install the root-level dependencies (for `npm-run-all`):
   ```bash
   pnpm install
   ```

---

## Running the Application

Start the API Gateway, Service One, and Service Two simultaneously:
```bash
pnpm start
```

---

## Sample Requests

### Base URL
```
http://localhost:3000/api/{service-name}/{controller-name}/{id?}
```

### Example Endpoints

#### **Service One**
1. `GET /api/service-one/exampleController/1`
   - Fetch an item by ID.
   - Response:
     ```json
     {
       "message": "Service One: Fetched item with ID 1",
       "item": {
         "id": 1,
         "name": "Item One"
       }
     }
     ```

2. `GET /api/service-one/exampleController`
   - Fetch all items.
   - Response:
     ```json
     {
       "message": "Service One: Fetched all items",
       "items": [
         {
           "id": 1,
           "name": "Item One"
         }
       ]
     }
     ```

3. `POST /api/service-one/exampleController`
   - Body:
     ```json
     {
       "name": "New Item"
     }
     ```
   - Response:
     ```json
     {
       "message": "Service One: Created a new item",
       "createdItem": {
         "id": 1,
         "name": "New Item"
       }
     }
     ```

#### **Service Two**
1. `PUT /api/service-two/anotherController/2`
   - Body:
     ```json
     {
       "name": "Updated Item"
     }
     ```
   - Response:
     ```json
     {
       "message": "Service Two: Updated item with ID 2",
       "updatedItem": {
         "id": 2,
         "name": "Updated Item"
       }
     }
     ```

2. `DELETE /api/service-two/anotherController/2`
   - Response:
     ```json
     {
       "message": "Service Two: Deleted item with ID 2"
     }
     ```

---

## How It Works

1. A REST request reaches the **API Gateway**.
2. The gateway parses the URL to extract the `serviceName`, `controllerName`, and determines the action based on the HTTP verb.
3. The request is forwarded to the corresponding service via RabbitMQ.
4. The service processes the request using the appropriate controller and action, and sends back the response through a temporary queue.

---

## Service to Service communication

1. The communications happens with RabbitMQ, using the functions on the helper library.
2. For asynchronous requests (that you don't need response) you can use the `sendAsync` method
3. For synchronous requests (that you need the response from the service) you can use the `sendRPC` method
4. Both methods are showcased in anotherController inside service-two accessing service-one
---

## Adding a New Service

1. Create a new folder (e.g., `service-three`) with an `index.js` and any required controllers.
2. Implement controllers with the standard actions (`getByIdAction`, `getAllAction`, etc.).
3. Update the `package.json` file with the `start` script for the new service.
4. Run the application as usual.

---

## Technologies Used

- **Node.js**: Backend runtime.
- **Express.js**: HTTP server for the API Gateway.
- **RabbitMQ**: Message broker for inter-service communication.
- **npm-run-all**: Tool for running multiple processes concurrently.
