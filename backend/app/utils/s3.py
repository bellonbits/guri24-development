import boto3
from botocore.exceptions import ClientError
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class S3Client:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
            use_ssl=settings.S3_USE_SSL
        )
        self.bucket_name = settings.S3_BUCKET

    def upload_file(self, file_obj, object_name: str, content_type: str = None) -> bool:
        """Upload a file-like object to S3 bucket"""
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type

            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                object_name,
                ExtraArgs=extra_args
            )
            logger.info(f"Successfully uploaded {object_name} to {self.bucket_name}")
            return True
        except ClientError as e:
            logger.error(f"S3 Upload Error: {e}")
            return False

    def get_file_url(self, object_name: str) -> str:
        """Generate URL for the file"""
        # If external URL override is set (e.g. for Docker to host access), use it
        if settings.S3_PUBLIC_URL_OVERRIDE:
            override = settings.S3_PUBLIC_URL_OVERRIDE
            # If the override is relative, it's a configuration error, but we try to fix it
            if override.startswith('/'):
                logger.warning(f"S3_PUBLIC_URL_OVERRIDE is relative: {override}. This may cause issues on the frontend.")
                # We can't easily know the public host here, so we just return it and hope for the best
                # or we prefix it with the API URL if we had it.
            
            return f"{override.rstrip('/')}/{self.bucket_name}/{object_name}"
        
        # Otherwise return standard URL
        protocol = "https" if settings.S3_USE_SSL else "http"
        host = settings.S3_ENDPOINT.replace("http://", "").replace("https://", "")
        # If host is 'minio:9000' (internal), this URL will fail in browser.
        # This is why S3_PUBLIC_URL_OVERRIDE is critical for production.
        return f"{protocol}://{host}/{self.bucket_name}/{object_name}"

    def ensure_bucket_exists(self):
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            try:
                self.s3_client.create_bucket(Bucket=self.bucket_name)
                # Public read policy
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Sid": "PublicRead",
                            "Effect": "Allow",
                            "Principal": "*",
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"]
                        }
                    ]
                }
                import json
                self.s3_client.put_bucket_policy(
                    Bucket=self.bucket_name,
                    Policy=json.dumps(policy)
                )
            except ClientError as e:
                logger.error(f"Could not create bucket: {e}")

s3_client = S3Client()
