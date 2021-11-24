#!/usr/bin/env node
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
      console.error(
        `Unable to auto detect ARN. You can configure credentials by running "aws configure".`
      );
    }
    let Arn;
    if (arnStdout) {
      Arn = JSON.parse(arnStdout).Arn;
    }
    rl.question("ARN (eg. arn:aws:iam::23452422453:mfa/user): ", (ARN) => {
      rl.question("OTP (eg. 123456): ", (OTP) => {
        rl.question("REGION (eg. ap-southeast-2): ", (REGION) => {
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
              let setEnv;
              let copy;
              switch (process.platform) {
                case "win32":
                  setEnv = (name, value) => `setx ${name} ${value}`;
                  copy = (string) => `echo "${string}" | clip`;
                  break;
                case "darwin":
                  setEnv = (name, value) => `export ${name}=${value}`;
                  copy = (string) => `echo "${string}" | pbcopy`;
                  break;
                default:
                  setEnv = (name, value) => `${name}=${value}`;
              }
              const output = `${setEnv("AWS_ACCESS_KEY_ID", AccessKeyId)}
${setEnv("AWS_SECRET_ACCESS_KEY", SecretAccessKey)}
${setEnv("AWS_SESSION_TOKEN", SessionToken)}
${setEnv("AWS_REGION", REGION)}`;
              if (copy) {
                exec(copy(output));
                console.log(
                  "[Success] AWS Credentials copied to clipboard. Paste and execute to set environment variables."
                );
              } else {
                console.log(
                  "[Success] AWS Credentials retrieved. Please set as environment variables manually."
                );
                console.log(output);
              }

              process.exit(0);
            }
          );
        });
        rl.write("ap-southeast-2");
      });
    });
    if (Arn) rl.write(Arn.replace(":user/", ":mfa/"));
  });
});
