
var NhaMang = require('../../Models/NhaMang');
var MenhGia = require('../../Models/MenhGia');
var Bank    = require('../../Models/Bank/Bank');

const DEFAULT_NHAMANG = [
	{ name: 'VIETTEL',   value: 'VIETTEL',   nap: true, mua: true },
	{ name: 'VINAPHONE', value: 'VINAPHONE', nap: true, mua: true },
	{ name: 'MOBIFONE',  value: 'MOBIFONE',  nap: true, mua: true },
];

const DEFAULT_MENHGIA = [
	{ name: '10000',  values: 10000,  nap: true, mua: true },
	{ name: '20000',  values: 20000,  nap: true, mua: true },
	{ name: '50000',  values: 50000,  nap: true, mua: true },
	{ name: '100000', values: 100000, nap: true, mua: true },
	{ name: '200000', values: 200000, nap: true, mua: true },
	{ name: '500000', values: 500000, nap: true, mua: true },
];

module.exports = async function(client, nap = false){
	if (!!nap) {
		const active1 = NhaMang.find({nap: true}).exec();
		const active2 = MenhGia.find({nap: true}).exec();
		const active3 = Bank.findOne({}).exec();

		const values = await Promise.all([active1, active2, active3]);
		let nhamang = values[0] || [];
		let menhgia = values[1] || [];

		if (!nhamang.length) {
			try {
				await NhaMang.insertMany(DEFAULT_NHAMANG, { ordered: false });
			} catch (e) {
				// ignore duplicate inserts
			}
			nhamang = DEFAULT_NHAMANG;
		}

		if (!menhgia.length) {
			try {
				await MenhGia.insertMany(DEFAULT_MENHGIA, { ordered: false });
			} catch (e) {
				// ignore duplicate inserts
			}
			menhgia = DEFAULT_MENHGIA;
		}

		const data = { nhamang: nhamang, menhgia: menhgia, momo: values[2] };
		client.red({shop:{nap_red: {info:data}}});
	}else{
		const active1 = NhaMang.find({mua: true}).exec();
		const active2 = MenhGia.find({mua: true}).exec();

		const values = await Promise.all([active1, active2]);
		const data = {nhamang: values[0], menhgia: values[1]}
		client.red({shop:{mua_the_nap: {info:data}}});
	}
}
