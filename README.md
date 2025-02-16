# Driverless-Humans
This repository contains an app designed to improve accessibility for users with various disabilities in the context of autonomous buses.

# Local DB setup 
Run "sudo docker run --name <instance name> -e POSTGRES_USER=<> -e POSTGRES_PASSWORD=<> -p <port>:<port> -d postgres" to create a local docker instance hosting the DB
Run "pip install psycopg2-binary flask-sqlalchemy"
Then "sudo docker exec -it my_postgres psql -U myuser" to access your postgresql shell and "CREATE DATABASE mydatabase;" to create the database. Followed by "\q" to quit

