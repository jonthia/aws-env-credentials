#!/usr/bin/node
const { exec } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

exec("which aws", async (error) => {
  if (error) {
    console.error(
      `Please install the AWS CLI to continue: https://aws.amazon.com/cli/`
    );
    process.exit(0);
  }

  exec(`aws sts get-caller-identity`, (arnError, arnStdout, arnStderr) => {
    if (arnError || arnStderr) {
      console.error(arnError || arnStderr);
    }
    const { Arn } = JSON.parse(arnStdout);
    rl.question("REGION (eg. ap-southeast-2): ", (REGION) => {
      rl.question("ARN (eg. arn:aws:iam::444484274653:mfa/name): ", (ARN) => {
        rl.question("OTP (eg. 123456): ", (OTP) => {
          exec(
            `aws sts get-session-token --serial-number ${ARN} --token-code ${OTP}`,
            (tokenError, tokenStdout, tokenStderr) => {
              if (tokenError || tokenStderr) {
                console.error(tokenError || tokenStderr);
                process.exit(0);
              }

              const { Credentials } = JSON.parse(tokenStdout);
              const { AccessKeyId, SecretAccessKey, SessionToken } =
                Credentials;
              exec(`
                export AWS_ACCESS_KEY_ID=${AccessKeyId}
                export AWS_SECRET_ACCESS_KEY=${SecretAccessKey}
                export AWS_SESSION_TOKEN=${SessionToken}
                export AWS_REGION=${REGION}
              `);
              console.log("[Success] AWS Credentials set.");
              console.log(`AWS_ACCESS_KEY_ID=${AccessKeyId.substr(0, 8)}...`);
              console.log(
                `AWS_SECRET_ACCESS_KEY=${SecretAccessKey.substr(0, 8)}...`
              );
              console.log(`AWS_SESSION_TOKEN=${SessionToken.substr(0, 8)}...`);
              process.exit(0);
            }
          );
        });
      });
      if (Arn) rl.write(Arn.replace(":user/", ":mfa/"));
    });
    rl.write("ap-southeast-2");
  });
});
