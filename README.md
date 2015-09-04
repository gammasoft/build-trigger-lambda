# build-trigger-lambda
Aws lambda function that triggers an ec2 instance passing Github release hook data

Use the following template mapping with AWS API Gateway:

```text
{
  "signature": "$input.params('X-Hub-Signature')",
  "type": "$input.params('X-GitHub-Event')",
  "data" : $input.json('$')
}
```
