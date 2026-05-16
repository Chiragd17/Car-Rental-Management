# Enable Location-Based Filtering for Vehicles

Currently, vehicles are not tied to any specific region in the database. When a user searches for a specific city like "Mumbai - Marine Drive", the search bar correctly passes the location, but the system just returns all cars because it doesn't know where the cars are physically located.

This plan outlines the steps to connect vehicles to specific locations and filter them accurately during a search.

## Open Questions
- Do you want all your existing vehicles to default to **"Mumbai - Marine Drive"**, or would you prefer me to randomly distribute them across the different cities so you have a realistic looking fleet immediately?

## Proposed Changes

### Database Updates
#### schema.sql
- Add a new column `location VARCHAR(100)` to the `vehicle` table.
- I will run a direct MySQL command to alter your live `car_rental_db` to add this column to the existing vehicles.

### Backend API
#### vehicleModel.js
- Update `create()` and `update()` methods to save the new `location` field into the database.
- Upgrade `findAll()` to accept a `location` parameter. If a location is provided, the SQL query will automatically append `WHERE location = ?` to filter the results at the database level.

#### vehicleController.js
- Update `getAllVehicles` to read `req.query.location` and pass it down to the model.
- Update `createVehicle` and `updateVehicle` to extract `req.body.location`.

### Admin Dashboard
#### admin.jsx
- Update the **Add/Edit Vehicle Modal**.
- Add a new "Location" dropdown containing the exact same list of 10 cities used in the main search bar. 
- This will allow you (the admin) to easily re-assign cars to different cities on the fly.

### Frontend Search & Results
#### Results.jsx
- Update the API call in `useEffect` so that it grabs the `location` from the URL parameters (e.g., `?location=Mumbai`) and passes it explicitly to the backend `getVehicles` API.

## Verification Plan

### Automated Tests
- Run `mysql -u root -e "DESCRIBE vehicle;"` to ensure the `location` column is present.

### Manual Verification
1. I will assign one specific car to **"Delhi - India Gate"** via the database.
2. I will perform a search for **"Delhi - India Gate"** on the home page.
3. We will verify that only the Delhi car shows up in the results, confirming the filter works end-to-end.
