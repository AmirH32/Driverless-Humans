# Driverless-Humans
This repository contains an app designed to improve accessibility for users with various disabilities in the context of autonomous buses.

# Installing all packages
run `pip install requirements.txt`.  If you don't want this to be a global installation make sure to create a `\venv` virtual environment.

# Running the app
Navigate to Backend and run `flask run` to start the backend up

On a seperate terminal, do the following:
1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app (navigate to Frontend first)

   ```bash
    npx expo start

# Local DB setup 
Run `sudo docker run --name <instance name> -e POSTGRES_USER=<> -e POSTGRES_PASSWORD=<> -p <port>:<port> -d postgres` to create a local docker instance hosting the DB
Run `pip install psycopg2-binary flask-sqlalchemy`
Then `sudo docker exec -it my_postgres psql -U myuser` to access your postgresql shell and `CREATE DATABASE mydatabase;` to create the database. Followed by "\q" to quit.

# Updating the DB
`flask db migrate -m` creates a new migration script to update the database schema
`flask db upgrade` applies the newly generated migrated to the db.
To view the database run `sudo docker exec -it my_postgres psql -U myuser` and then `\c mydatabase` followed by `\dt` and you should see the relations.
