/**
 * Author: chenboxiang
 * Date: 14-7-2
 * Time: 下午5:52
 */
"use strict";

var urllib = require("urllib")
var _ = require("lodash")
var FromStream = require("formstream")
var path = require("path")

var defaultConfig = {
    baseUrl: "https://api.mailgun.net/v3",
    // 10 seconds
    timeout: 10000
}

/**
 * @param {Object} config
 * @constructor
 */
function Mailgun(config) {
    this.config = _.extend({}, defaultConfig, config)
    if (!this.config.domain) {
        throw new Error("[config.domain] is required")
    }
    if (!this.config.apiKey) {
        throw new Error("[config.apiKey] is required")
    }
}

/**
 * @param {Object} data see http://documentation.mailgun.com/api-sending.html#sending
 */
Mailgun.prototype.send = function(data) {
    if (!data.from) {
        data.from = this.config.from
    }
    if (!data.from) throw new Error("[from] is required")

    var url = this.config.baseUrl + "/" + this.config.domain + "/messages"
    var options = {
        method: "post",
        timeout: this.config.timeout,
        auth: "api:" + this.config.apiKey,
        dataType: "json"
    }

    if (data.attachment) {
        var attachments = data.attachment
        if (!Array.isArray(attachments)) {
            attachments = [attachments]
        }
        // 校验attachment
        attachments.forEach(function(attachment) {
            if (!attachment.file) {
                throw new Error("[attachment] is invalid, [attachment.file] is required")
            }
            if (!attachment.name) attachment.name = path.basename(attachment.file)
        })

        var formStream = new FromStream()
        Object.keys(data).forEach(function(name) {
            if (name !== "attachment") {
                formStream.field(name, data[name])
            }
        })
        attachments.forEach(function(attachment) {
            formStream.file("attachment", attachment.file, attachment.name)
        })

        options.headers = formStream.headers()
        options.stream = formStream

    } else {
        options.data = data
    }

    function _wrapCallback(callback) {
        return function(err, data, res) {
            // 非200-300的code也算作error
            if (null == err &&
                !(res.statusCode >= 200 && res.statusCode < 300)) {
                err = new Error("The mailgun server response error, status code is [" + res.statusCode + "]")
            }
            callback(err, data, res)
        }
    }

    return function(callback) {
        urllib.request(url, options, _wrapCallback(callback))
    }
}

module.exports = Mailgun