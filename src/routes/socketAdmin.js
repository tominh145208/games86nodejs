require('dotenv').config();
let validator = require('validator');
let jwt = require('jsonwebtoken');
let User = require('../app/Models/Admin');
let socket = require('../app/Controllers/admin/socket.js');
let captcha = require('../app/Helpers/captcha');
let helpers = require('../app/Helpers/Helpers');
let getDataContent = require('../app/Helpers/Helpers').getDataContent;
let setDataContent = require('../app/Helpers/Helpers').setDataContent;
let TeleMsg = require('../app/Helpers/Telegram');
let AdminHistory = require('../app/Models/AdminHistory');

let verifyToken = (authToken) => {
    try {
        const payload = jwt.verify(authToken, process.env.SCRET_KEY);
        return payload.username;
    } catch (e) {
        return null;
    }
};

// Authenticate!
let authenticate = function (client, data, callback) {

    let AUTHEN_TYPE = {
        'TOKEN': 'token',
        'ACCOUNT': 'account'
    }

    if (!!data && !!data.authtype) {

        let ipAndress = data.ip || '';
        const requireOtp = String(process.env.ADMIN_REQUIRE_OTP || 'true').toLowerCase() === 'true';

        if (data.authtype == AUTHEN_TYPE.TOKEN) {

            if (!!data.token) {
                const username = verifyToken(data.token);

                User.findOne({ 'username': username }, 'username', function (err, user) {
                    if (!!user) {
                        client.UID = user._id.toString();
                        client.RedName = user.username;
                        client.ipAndress = ipAndress;
                        callback(false, true);
                    } else {
                        callback({ title: 'THẤT BẠI', text: 'Truy cập hết hạn !!' }, false);
                    }
                });

            } else {
                callback({ title: 'THÔNG BÁO', text: 'Có lỗi xảy ra, vui lòng kiểm tra lại!!' }, false);
            }

        } else if (data.authtype == AUTHEN_TYPE.ACCOUNT) {

            if (!!data.username && !!data.password && (!!data.otp || !requireOtp)) {

                let otp = ('' + (data.otp || '') + '').trim();
                let username = ('' + data.username + '').trim();
                let password = ('' + data.password + '').trim();
                let az09 = new RegExp('^[a-zA-Z0-9]+$');
                let testName = az09.test(username);

                // validate otp (only when required)
                if (requireOtp) {
                    if (!validator.isLength(otp, { min: 6, max: 6 })) {
                        callback({ title: 'ĐĂNG NHẬP', text: 'OTP không hợp lệ' }, false);
                        return;
                    }

                    let currentOtp = (getDataContent('otpCms') || '').toString().trim();
                    if (otp !== currentOtp) {
                        callback({ title: 'ĐĂNG NHẬP', text: 'OTP không đúng' }, false);
                        return;
                    }
                }

                if (!validator.isLength(username, { min: 3, max: 32 })) {
                    callback({ title: 'ĐĂNG NHẬP', text: 'Tài khoản (3-32 kí tự).' }, false);
                } else if (!validator.isLength(password, { min: 5, max: 32 })) {
                    callback({ title: 'ĐĂNG NHẬP', text: 'Mật khẩu (6-32 kí tự)' }, false);
                } else if (!testName) {
                    callback({ title: 'ĐĂNG NHẬP', text: 'Tên đăng nhập chỉ gồm kí tự và số !!' }, false);
                } else {
                    try {
                        username = username.toLowerCase();
                        User.findOne({ 'username': username }, function (err, user) {
                            if (!!user) {
                                if (user.validPassword(password)) {
                                    user.fail = 0;
                                    user.save();
                                    client.UID = user._id.toString();
                                    client.RedName = user.username;
                                    client.ipAndress = ipAndress;

                                    // save login to logs
                                    AdminHistory.create({
                                        name: user.username,
                                        action: `Đăng nhập hệ thống`,
                                        description: `Đăng nhập với IP: ${ipAndress}`
                                    });

                                    callback(false, true);
                                } else {
                                    user.fail = user.fail >> 0;
                                    user.fail += 1;
                                    user.save();
                                    callback({ title: 'ĐĂNG NHẬP', text: 'Mật khẩu không chính xác!!' }, false);
                                }
                            } else {
                                callback({ title: 'ĐĂNG NHẬP', text: 'Tài Khoản hoặc mật khẩu không chính xác!!' }, false);
                            }
                        });
                    } catch (error) {
                        callback({ title: 'THÔNG BÁO', text: 'Có lỗi xảy ra, vui lòng kiểm tra lại!!' }, false);
                    }
                }
            }
        }
    }
};


let otp = (redT, data) => {
    if (!!data) {
        if (void 0 !== data.getotp) {
            let otpCode = helpers.randomInteger(100000, 999999);
            setDataContent('otpCms', otpCode.toString());
            TeleMsg(process.env.TELEGRAME_CMS, `OTP Code: ${otpCode}\nIP Access: ${data.getotp.ip}`);
            // reset mã otp sau 15s
            setTimeout(() => {
                setDataContent('otpCms', helpers.randomInteger(100000, 999999999999).toString());
            }, 20000);
        }
    }
}

module.exports = function (ws, redT) {
    ws.admin = true;
    ws.auth = false;
    ws.UID = null;
    ws.captcha = {};
    ws.c_captcha = captcha;
    ws.red = function (data) {
        try {
            this.readyState == 1 && this.send(JSON.stringify(data));
        } catch (err) { }
    }

    ws.on('message', function (message) {
        try {
            if (!!message) {
                message = JSON.parse(message);
                if (!!message.captcha) {
                    this.c_captcha(message.captcha);
                }

                if (this.auth == false && !!message.otp) {
                    otp(redT, message.otp);
                }

                if (this.auth == false && !!message.authentication) {
                    authenticate(this, message.authentication, function (err, success) {
                        if (success) {
                            ws.auth = true;
                            ws.redT = redT;
                            if (void 0 !== ws.redT.admins[ws.UID]) {
                                ws.redT.admins[ws.UID].push(ws);
                            } else {
                                ws.redT.admins[ws.UID] = [ws];
                            }
                            socket.auth(ws);
                        } else if (!!err) {
                            ws.red({ unauth: err });
                        } else {
                            ws.red({ unauth: { message: 'Authentication failure' } });
                        }
                    });
                } else if (!!this.auth) {
                    socket.message(this, message);
                }
            }
        } catch (error) { }
    });

    ws.on('close', function (message) {
        if (this.UID !== null && void 0 !== this.redT.admins[this.UID]) {
            if (this.redT.admins[this.UID].length === 1 && this.redT.admins[this.UID][0] === this) {
                delete this.redT.admins[this.UID];
                if (this.redT) {
                    delete this.redT;
                }
            } else {
                var self = this;
                this.redT.admins[this.UID].forEach(function (obj, index) {
                    if (obj === self) {
                        self.redT.admins[self.UID].splice(index, 1);
                        if (self.redT) {
                            delete self.redT;
                        }
                    }
                });
            }
        }
        this.auth = false;
    });
}
