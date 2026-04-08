// Initialize admin account from env variables.
require("dotenv").config();
const assert = require("assert");
const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

assert(ADMIN_USERNAME, "ADMIN_USERNAME configuration is required.");
assert(ADMIN_PASSWORD, "ADMIN_PASSWORD configuration is required.");

const Admin = require("../app/Models/Admin");
const generateHash = require("../app/Helpers/Helpers").generateHash;
const AdminPerConfig = require("../data/adminPermission");
const AdminPermission = require("../app/Models/AdminPermission");

const ensureAdminPermissions = async (username) => {
    for (const [key, value] of Object.entries(AdminPerConfig)) {
        const permission = await AdminPermission.findOne({
            username,
            permission: value,
        })
            .select("_id")
            .lean();

        if (!permission) {
            await AdminPermission.create({
                username,
                permission: value,
                status: true,
            });
            console.log(`[${username}] => Created permission: ${key}`);
        }
    }
};

(async () => {
    try {
        let admin = await Admin.findOne({ username: ADMIN_USERNAME });

        if (!admin) {
            admin = await Admin.create({
                username: ADMIN_USERNAME,
                password: generateHash(ADMIN_PASSWORD),
                rights: 9,
                regDate: new Date(),
            });
            console.log(`[${ADMIN_USERNAME}] => Created admin account from env`);
        } else if (!admin.validPassword(ADMIN_PASSWORD)) {
            admin.password = generateHash(ADMIN_PASSWORD);
            await admin.save();
            console.log(`[${ADMIN_USERNAME}] => Synced admin password from env`);
        }

        await ensureAdminPermissions(ADMIN_USERNAME);
    } catch (err) {
        console.log(`Admin init error: ${err && err.message ? err.message : err}`);
    }
})();
