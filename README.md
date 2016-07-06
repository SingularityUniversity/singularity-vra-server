# Required Components
1) Django
2) Postgres
3) Redis
4) EmbedLy account
5) ElasticSearch (you'll need to add `script.inline: true` and `script.indexed: true` to the elasticsearch.yml file locally
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

## Running Tests
1. Client-side (javascript): Set up the environment and run `npm test`. You can also run `npm run test-coverage` to produce a somewhat-accurate coverage report for those tests.
2. Server-side (python): Set up the environment (no live server need run though - db, elasticsearch probably do need to be running), and run `python manage.py test`2. Server-side (python): Set up the environment (no live server need run though - db, elasticsearch probably do need to be running), and run `python manage.py test`
