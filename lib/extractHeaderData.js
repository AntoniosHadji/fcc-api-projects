const extractHeaderData = function(req) {
  let l = req.get('accept-language');
  l = l.slice(0, l.indexOf(','));
  let ua = req.get('user-agent');
  let bos = ua.slice(ua.indexOf('(')+1, ua.indexOf(')'));

  let ipAddr = req.headers['x-forwarded-for'];
  if (ipAddr) {
    let list = ipAddr.split(',');
    ipAddr = list[list.length-1];
  } else {
    ipAddr = req.connection.remoteAddress;
  }

   return {
     ip: ipAddr,
     lang: l,
     os: bos,
   };
};

module.exports = extractHeaderData;

