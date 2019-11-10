# Bolt-OAuth
A library to assist you with OAuth when using Slack's [Bolt](https://slack.dev/bolt) framework.

# Install

`npm install bolt-oauth`

# Usage

The library might seem complicated at first, but it's really not!

### Step 1: Setup Callback Functions
First, you need to create some callback functions for the OAuth events.

##### Success Callback
This is for when the OAuth was successful and nothing went wrong!

```
const oauthSuccess = ({ res, oAuthResult }) => {
  // save oAuthResult in MongoDB or somewhere else permanent since it has all the tokens
    res.redirect('<successfully_installed_thankyou_page_url>');
};
```
- `res` is an ExpressJS response object
- `oAuthResult` is the result from the Slack OAuth call with all the good stuff you need

A sample `oAuthResult` is
```
{
    ok: true,
    access_token: 'xoxp-12345678901-234567890123-abcdefghijklmnopqrstuvwxyzabcdef',
    scope: 'identify,bot,commands',
    user_id: 'U12345678',
    team_id: 'T12345678',
    enterprise_id: null,
    team_name: 'Sopinka Inc.',
    bot: {
        bot_user_id: 'U90123456',
        bot_access_token: 'xoxb-12345678901-456789012345-ghijklmnopqrstuvwxyzabcdefghijkl'
    },
    response_metadata: {}
}
```

##### Error Callback
This is for when the OAuth throws an error at any point.

```
const oauthError = (error) => {
    // do something about that error to let the user know
};
```

##### State Check
You'll want to implement this function if you're doing a state check on OAuth to prevent XRSF attacks. If you're not already, you'll want to do this as a best practice.

```
const oauthStateCheck = (oAuthState) => {
    // check the parameter state against your saved state to ensure everything is ok
    return true;
};
```

##### Authorize
Since you've got distribution on, and multiple teams using your app, you'll need to implement a custom authorize function, as outlined on the [official documentation](https://slack.dev/bolt/concepts#authorization).

```
const authorizeFn = ({ teamId, enterpriseId, userId, conversationId }) => {
    // go to your MongoDB or wherever you've stored the tokens and get the values based on teamId and/or userId
    return <your_tokens>;
};
```
`<your_tokens>` will need to be an object formatted something like this:
```
return {
    userToken: team.userToken,
    botToken: team.botToken,
    botId: team.botId,
    botUserId: team.botUserId
 }
```

### Step 2: Implement into your Bolt app
Now the fun stuff! Require the library and modify your Bolt `App` constructor to look something like this:

```
const { App } = require('@slack/bolt');
const Auth = require('bolt-oauth');

const app = new App({
    authorize: authorizeFn,
    receiver: Auth({
        clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    redirectUrl: process.env.SLACK_REDIRECT_URL,
    stateCheck: oauthStateCheck,
    onSuccess: oauthSuccess,
    onError: oauthError
    })
});
```
- The environment variables above should be self-explanatory.
- All fields are **required**.

### Step 3: Celebrate 🎉

That's it! You're all set! Now submit your app to the Slack App Directory and share your creation with the world!

# LICENSE

The MIT License (MIT)

Copyright (c) 2019 Alex Sopinka.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
