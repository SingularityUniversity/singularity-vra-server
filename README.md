# Required Components
1. Django (1.10.5)
2. Postgres (tested with 9.5.2 and 9.5.5)
3. Redis (tested with 3.2.4 and 3.2.6)
4. EmbedLy account
5. ElasticSearch  (tested with 2.3.3 and 2.4.0)
    - you'll need to add `script.inline: true` and `script.indexed: true` to the 
      elasticsearch.yml file locally
6. AWS S3 account
7. SMTP server/service
8. Node (7.4.0)
9. Python (tested with 3.5 and 3.6)

See requirements.txt and package.json for all libraries and modules that are 
used and see sample.env for configuration examples

## System Setup
1. create/enter virtual environment
2. `$ pip install -r requirements.txt`
3. `$ npm install`
4. `$ (cd node_modules/material-ui; npm install)`
5. create database
6. edit .env and update database URL
7. create tables (`python manage.py migrate`)
8. create elasticsearch indices
    - main index: `curl -XPUT <SEARCHBOX_URL>/<ELASTICSEARCH_INDEX>`
    - query index: `curl -XPUT <SEARCHBOX_URL>/<ELASTICSEARCH_SEARCH_STATS_INDEX>`

## Environment Setup
### Using an Existing Installation
1. Get content (cp/sync from aws)
2. Load content into database (`$ python manage.py import_content <content directory>`)
3. Recreate the document index (`$ python manage.py recreate_index`)
4. Create the LDA data (`$ python manage.py create_and_upload_lda`)
5. Install the LDA data (`$ python manage.py fetch_lda`)
6. Create query index and mappings (`$ python manage.py create_query_index`)

### Using a New Feed
1. Configure feed (`$ python manage.py add_rss <url>`)
2. Wait for content to be loaded (this is done every 24 hours during the night)
   or ingest documents manually (`$ python manage.py refresh_rss`)


## Running server locally
To access the Web UI (with hot loading of both python and javascript):
1. `$ npm run serve`
2. `$ heroku local` (or `$ python manage.py runserver` to run only the web 
   process)

## Running Tests
1. Client-side (javascript): Set up the environment and run `npm test`. You can 
   also run `npm run test-coverage` to produce a somewhat-accurate coverage 
   report for those tests.
2. Server-side (python): Set up the environment (no live server need run though 
   database and elasticsearch probably do need to be running), and run 
   `python manage.py test`
