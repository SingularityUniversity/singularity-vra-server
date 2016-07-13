# Required Components
1) Django
2) Postgres
3) Redis
4) EmbedLy account
5) ElasticSearch (you'll need to add `script.inline: true` and `script.indexed: true` to the elasticsearch.yml file locally
6) AWS S3 account
7) Node

See sample.env for configuration examples

## System Setup
1. create/enter virtual environment
2. `$ pip install -r requirements.txt`
3. `$ npm install`
4. `$ (cd node_modules/material-ui; npm install)`

## Environment Setup
1. Get content (cp/sync from aws)
2. Load content into database (`$ python manage.py import_content`)
3. Recreate the document index (`$ python manage.py recreate_index`)
4. Create the LDA data (`$ python manage.py create_and_upload_lda`)
5. Install the LDA data (`$ python manage.py fetch_lda`)
6. Create query index and mappings (`$ python manage.py create_query_index`)

## Running server locally
To access the Web UI (with hot loading of both python and javascript):
1. `$ npm run serve`
2. `$ heroku local` (or `$ python manage.py runserver` to run only the web process)

## Running Tests
1. Client-side (javascript): Set up the environment and run `npm test`. You can also run `npm run test-coverage` to produce a somewhat-accurate coverage report for those tests.
2. Server-side (python): Set up the environment (no live server need run though - db, elasticsearch probably do need to be running), and run `python manage.py test`2. Server-side (python): Set up the environment (no live server need run though - db, elasticsearch probably do need to be running), and run `python manage.py test`
