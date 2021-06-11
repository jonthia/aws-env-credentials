# aws-env-credentials

A light-weight package that retrieves commands to set AWS credentials as shell environment variables. Copy to clipboard is supported on macOS and Windows (Command Prompt).

## Usage

`npx aws-env-credentials`

Follow the prompts for AWS region, ARN for MFA, and OTP.
If a token is successfully retrieved a command will be copied to your clipboard our output in the terminal to set shell environment variables.

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
AWS_REGION
```

## AWS Documentation

https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html

## NPM

https://www.npmjs.com/package/aws-env-credentials
