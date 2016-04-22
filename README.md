# Required Components
1) Django
2) Postgres
3) Redis
4) EmbedLy account
5) ElasticSearch
6) AWS S3 account
7) Node

See sample.env for configuration examples

## Setup
1. create/enter virtual environment
2. `$ pip install -r requirements.txt`
3. `$ npm install`
4. `$ (cd node_modules/material-ui; npm install)`

## Running server locally
To access the Web UI (with hot loading of both python and javascript):
1. `$ npm run serve`
2. `$ heroku local` (or `$ python manage.py runserver` to run only the web process)
