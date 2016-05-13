#!/bin/bash

# create bundle
echo "Building bundle"
result=`npm run build-prod`
if [[ $result == *"ERROR"* ]]; then
  echo "Problem building bundle, exiting..."
  echo "$result"
  exit 1
fi

# verify that we have the latest code
echo "Verifying local repo is up to date"
git fetch -q
result=`git status`
if [[ $result == *"Your branch is behind"* ]]; then
  echo "Repo not up to date, pull first"
  exit 1
fi

# add bundle and stats to git
echo "Adding bundle and stats files"
result=`git add -v --dry-run assets/client-dist`
count=`echo "$result" | wc -l`
if [ $count != 2 ]; then
  echo "Incorrect number of files ($count) being added, exiting..."
  exit 1
fi
(IFS='
'
for i in $result; do
  if  [[ "$i" != "add 'assets/client-dist/main-"* && "$i" != "add 'assets/client-dist/webpack-stats-prod.json'" ]]; then
    echo "Unknown file ($i) being added, exiting..." 
    exit 1
  fi
done)
result=`git add assets/client-dist`
result=`git commit -m "Updated bundle and stats files"`

# push commit to github
echo "Pushing commit to github"
result=`git push`
if [[ $result == *"rejected"* ]]; then
  echo "Failed to commit, exiting..."
  echo "$result"
  exit 1
fi

# make sure vra is the heroku remote
echo "Setting git:remote"
result=`heroku git:remote -a vra`
if [[ "$result" != "set git remote heroku to https://git.heroku.com/vra.git" ]]; then
  echo "Error setting heroku git:remote"
  echo "$result"
  exit 1
fi

# push to heroku
echo "Pushing to heroku"
result=`git push heroku master`
 
# XXX: what errors should be detected?
