/**
 * Author: chenboxiang
 * Date: 14-7-2
 * Time: 下午11:16
 */
"use strict";

var Mailgun = require("../index")
var expect = require("expect.js")
var path = require("path")

describe("Mailgun Client", function() {
    before(function() {
        this.mailgun = new Mailgun({
            domain: "scipub.mailgun.org",
            apiKey: "key-0grugne-b1xa97y3982yovs5g8oqmnp0",
            from: "Support<support@scipub.mailgun.org>"
        })
    })

    describe("#send(data, callback)", function(done) {
        it("should send email to mailgun successfully", function(done) {
            this.mailgun.send({
                to: "gozap.chenboxiang@gmail.com",
                subject: "test to",
                text: "hello! \n chenboxiang",
                attachment: [{
                    file: path.join(__dirname, "test.gif")
                }, {
                    file: path.join(__dirname, "test.gif")
                }]

            })(function(err, data, res) {
                expect(err).to.be(null)
                expect(res.statusCode).to.be(200)
                done()
            })
        })
    })
})