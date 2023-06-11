const fds = require('fs');

const spents = { grandTotal: 0 },
	billPayments = { grandTotal: 0 },
	refunds = { grandTotal: 0 };

// const bookKeeping = (map, vendor, date, time, value) => {
// 	const highLevelVendorName = vendor.split(' ').slice(0, 2).join(' ');
// 	const VendorSubName = vendor.split(' ').slice(2, -1).join(' ');
// 	if (map[highLevelVendorName]) {
// 		const mapVenRef = map[highLevelVendorName][VendorSubName];
// 		if (mapVenRef) {
// 			map[highLevelVendorName][VendorSubName].push({
// 				date: `${date}-${time}`,
// 				value,
// 			});
// 			map[highLevelVendorName][VendorSubName].total += value;
// 		} else {
// 			map[highLevelVendorName][VendorSubName] = [
// 				{ date: `${date}-${time}`, value },
// 			];
// 			map[highLevelVendorName].total = value;
// 		}
// 	} else {
// 		map[highLevelVendorName] = {
// 			[VendorSubName]: [{ date: `${date}-${time}`, value }],
// 		};
// 		map[highLevelVendorName].total = value;
// 	}
// 	map.grandTotal += value;
// };
const bookKeeping = (map, vendor, date, time, value) => {
	const highLevelVendorName = vendor.split(' ').slice(0, 2).join(' ');
	if (map[highLevelVendorName]) {
		map[highLevelVendorName].push({ date: `${date}-${time}`, value });
		map[highLevelVendorName].total += value;
	} else {
		map[highLevelVendorName] = [{ date: `${date}-${time}`, value }];
		map[highLevelVendorName].total = value;
	}
	map.grandTotal += value;
};
fds.readFile('report copy.csv', 'UTF-8', (err, data) => {
	data.split('\n').forEach((element, i) => {
		if (element.trim().length) {
			const [vendor, date, time, valueStr, meta1, meta2] = element
				.replaceAll(`"`, '')
				.replace(/\s\s+/g, ' ')
				.split(',');

			// "COSTCO WHOLESALE W162    BRAMPTON     ON","REFUND","TEJINDER","02/06/2023","05:00 AM","642.96"
			vendor === 'Payment BNS' // check fro type of transaction ie. spent or bill payment
				? // for bill payment we have different type of structure
				  bookKeeping(
						billPayments,
						'Payment',
						valueStr,
						meta1,
						parseFloat(meta2)
				  )
				: date === 'REFUND'
				? bookKeeping(
						refunds,
						vendor,
						valueStr,
						meta1,
						Math.abs(parseFloat(meta2))
				  )
				: bookKeeping(
						spents,
						vendor,
						date,
						time,
						Math.abs(parseFloat(valueStr))
				  );
		}
	});
	console.log(refunds);
});
