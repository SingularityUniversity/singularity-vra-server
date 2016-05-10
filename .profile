# Grab the LDA stuff on bootup
if [[ $DYNO == web.* ]] ;
then
    python manage.py fetch_lda 
fi
