# COVID SPAIN TELEGRAM BOT

Hello everybody, this is my own telegram bot to know how many people are infected by day in Spain. There are many improvements in my mind but right not we only have available one command implemented, you can check it [here](https://t.me/CovidSpainBot).

## Contribute
I hope you can give me more ideas, or make this project better, there are a lot of data we can show and a lot of improvements you can give to us! Just fork and PR to the project, every commit will be well received.

## Create Telegram bot
First at all you've to create a telegram bot, to do this just follow [this steps](https://core.telegram.org/bots#6-botfather) and copy your telegram token, we'll use later.

## How to deploy your own telegram bot backend
We are using Nodejs and Serverless Framework in order to deploy our backend. If you want download the project and try yourself just type the next lines:

First, install node if you don't have it. I like nvm to do this.
```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```
and then, install node stable version
```shell
nvm install node stable
```
then, install serverless globally
```shell
npm install -g serverless
```
now, clone repo
```shell
git clone https://github.com/Chillaso/covid-increment-spain.git
```
export your telegram token (without <>)
```shell
export TELEGRAM_TOKEN=<your_telegram_token>
```
**make sure you have your AWS credentials configured, if you don't know anything about this, check [this guide](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html)**.

and now, its time to deploy
```shell
sls deploy
```

## Attach your backend to your bot
Open a terminal and enter this, replacing your endpoint that you get it in ``sls deploy`` output.
```shell
curl --request POST --url https://api.telegram.org/bot$TELEGRAM_TOKEN/setWebhook --header 'content-type: application/json' --data '{"url": "<your_api_endpoint>"}'
```
## TODO LIST
* Get data by day
* Get data by countries
* Better command view in telegram bot
* Cloudwatch event every day sending message with coronavirus news or updating data
* Death and healed information
* ...
