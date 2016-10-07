'use strict';

var cp     = require('child_process'),
	should = require('should'),
	service;

describe('Service', function () {
	this.slow(5000);

	after('terminate child process', function (done) {
		this.timeout(7000);
		setTimeout(() => {
			service.kill('SIGKILL');
			done();
		}, 5000);
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			should.ok(service = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			service.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			service.send({
				type: 'ready',
				data: {
					options: {
						api_key: 'ApY1DQW6gcWPJpXnQZoL8a6q0u-dPmg9oQvn3OZfMDij88z-Z1XUVJQAP9AaXjku'
					}
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});

	describe('#data', function () {
		it('should process the data and send back a result', function (done) {
			var requestId = (new Date()).getTime().toString();

			service.on('message', function (message) {
				if (message.type === 'result') {
					var data = JSON.parse(message.data);
					console.log(data);

					should.equal(data.result[0], '1776', 'Invalid return data.');
					should.equal(data.result[1], '1775', 'Invalid return data.');
					should.equal(data.result[2], '1777', 'Invalid return data.');
					should.equal(data.result[3], '1776', 'Invalid return data.');
					should.equal(message.requestId, requestId);
					done();
				}
			});

			service.send({
				type: 'data',
				requestId: requestId,
				data: {
                    coordinates: [35.89431,-110.72522,35.89393,-110.72578,35.89374,-110.72606,35.89337,-110.72662]
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});
});