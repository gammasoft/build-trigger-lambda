'use strict';

var ec2RunInstance = require('ec2-run-instance-lambda'),
    crypto = require('crypto'),
    env = process.env;

function handler(event, context) {
  var signature = event.signature,
      data = event.data,
      type = event.type,
      hmac,
      calculatedSignature,
      handler,
      userData;

  if(type !== 'release') {
    return context.fail('Event type must be "release" or "ping"');
  }

  hmac = crypto.createHmac('sha1', env.SECRET_TOKEN);
  hmac.update(JSON.stringify(data));
  calculatedSignature = 'sha1=' + hmac.digest('hex');

  if(calculatedSignature !== signature) {
      return context.fail('Forbidden');
  }

  handler = ec2RunInstance.newHandler({
    region: env.REGION
  });

  userData = {
    repository: data.repository.name,
    owner: data.repository.owner.login,
    version: data.release.tag_name,
    zipUrl: data.release.zipball_url
  };

  handler({
    imageId: env.IMAGE_ID,
    keyName: env.KEY_NAME,
    userData: new Buffer(JSON.stringify(userData)).toString('base64'),
    securityGroupIds: [
        env.SECURITY_GROUP_ID
    ],
    tags: [{
        key: 'environment',
        value: 'production'
    }, {
        key: 'lifeCycle',
        value: 'transient'
    }, {
        key: 'product',
        value: 'builder'
    }, {
        key: 'Name',
        value: 'builder'
    }, {
        key: 'version',
        value: [
            userData.owner,
            userData.repository,
            userData.version
        ].join('-')
    }]
  }, context);
}

module.exports.handler = handler;
