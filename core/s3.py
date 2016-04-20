from django.conf import settings
import json
from os import path, listdir

import boto3

s3_access_key_id = settings.S3_ACCESS_KEY_ID
s3_access_key_secret = settings.S3_ACCESS_KEY_SECRET
s3_bucket = settings.S3_BUCKET

client = boto3.client('s3',
                      aws_access_key_id=s3_access_key_id,
                      aws_secret_access_key=s3_access_key_secret)

s3_resource = boto3.resource('s3',
                             aws_access_key_id=s3_access_key_id,
                             aws_secret_access_key=s3_access_key_secret)

bucket = s3_resource.Bucket(s3_bucket)

CONTENT_FOLDER = 'content'
LDA_FOLDER = 'lda'


def _map_id_to_key(content_id):
    long_id = "{:06d}".format(content_id)
    return CONTENT_FOLDER+"/"+long_id[0:3]+'/'+long_id[3:6]+"/"+long_id+".json"


def _map_key_to_id(key):
    return int(key.split('/')[-1][:-5])


def put_content_to_s3(content):
    '''
    Put a core.models.Content object to the right place in s3
    '''
    body_text = json.dumps(
        {
            'id': content.id,
            'extract': content.extract
        }
    )

    key = _map_id_to_key(content.id)

    # Partition documents by id, breaking down
    client.put_object(
        Bucket=s3_bucket,
        Key=key,
        Body=body_text.encode('utf-8')
    )


def get_content_ids_at_s3():
    '''
    Grab a list of id's of documents stored at s3. This may not scale.
    '''
    objects = bucket.objects.filter(Prefix=CONTENT_FOLDER)
    keys = [_map_key_to_id(obj.key) for obj in objects]
    return keys


def sync_lda_from_s3(local_dir):
    '''
    Grab all the files in the lda remote dir and copy them to the local dir
    '''
    object_versions = bucket.objects.filter(Prefix=LDA_FOLDER)
    for obj_version in object_versions:
        local_filename = path.join(local_dir, obj_version.key.split('/')[-1])
        obj_version.Object().download_file(local_filename)


def sync_lda_to_s3(local_dir):
    '''
    Put up the local lda files to s3
    '''
    for filename in listdir(local_dir):
        with open(path.join(local_dir, filename), "rb") as local_file:
            bucket.put_object(Key=LDA_FOLDER+"/"+filename, Body=local_file)
