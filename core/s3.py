from django.conf import settings
import json

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

def _map_id_to_key(content_id):
    long_id = "{:06d}".format(content_id)
    return long_id[0:3]+'/'+long_id[3:6]+"/"+long_id+".json"

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

def get_ids_at_s3():
    '''
    Grab a list of id's of documents stored at s3. This may not scale.
    '''
    objects = bucket.objects.all()
    keys = [_map_key_to_id(obj.key) for obj in objects]
    return keys
