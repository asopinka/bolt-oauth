const { ExpressReceiver } = require('@slack/bolt');
const { WebClient } = require('@slack/web-api');

const Auth = ({ app, clientId, clientSecret, signingSecret, redirectUrl, stateCheck, onSuccess, onError, useSlackOauthV2 = false }) => {
	// param checks
	if (!clientId) { throw new Error('clientId is required.') };
	if (!clientSecret) { throw new Error('clientSecret is required.') };
	if (!signingSecret) { throw new Error('signingSecret is required.') };
	if (!redirectUrl) { throw new Error('redirectUrl is required.') };
	if (!onSuccess) { throw new Error('onSuccess is required.') };
	if (typeof(onSuccess) !== 'function') { throw new Error('onSuccess must be a function.') };
	if (!onError) { throw new Error('onError is required.') };
	if (typeof(onError) !== 'function') { throw new Error('onError must be a function.') };
	if (!stateCheck) { throw new Error('stateCheck is required.') };
	if (typeof(stateCheck) !== 'function') { throw new Error('stateCheck is required.') };

	// custom receiver
	const receiver = new ExpressReceiver({ signingSecret });

	// the express app
	const expressApp = receiver.app;

	// the oauth callback
	const callbackUrl = new URL(redirectUrl);
	expressApp.get(callbackUrl.pathname, async(req, res) => {
		// do a state check
		let state = req.query.state;
		let stateIsValid = stateCheck(state);

		// if not valid, throw error
		if (!stateIsValid) {
			await onError(new Error('Invalid state.'));
			return;
		}

		// get tokens
		const webClient = new WebClient(null);
		const method = useSlackOauthV2
		 ? webClient.oauth.v2.access
		 : webClient.oauth.access;
		return method({
		    client_id: clientId,
		    client_secret: clientSecret,
		    code: req.query.code,
		    redirect_url: redirectUrl
		}).then(async oAuthResult => {
			await onSuccess({ res, oAuthResult });
		}).catch(async error => {
		 	await onError(error);
		})
	});

	return receiver;
};

module.exports = ({ app, clientId, clientSecret, signingSecret, redirectUrl, stateCheck, onSuccess, onError, useSlackOauthV2 }) => {
	return Auth({ app, clientId, clientSecret, signingSecret, redirectUrl, stateCheck, onSuccess, onError, useSlackOauthV2 });
};
