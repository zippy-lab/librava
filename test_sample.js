const fs = require('fs');
const zlib = require('zlib');

try {
  const f = fs.readdirSync('.').find(x => x.endsWith('.html') && !x.startsWith('unpack') && !x.startsWith('template'));
  const str = fs.readFileSync(f, 'utf8');

  const startTag = '<script type="__bundler/manifest">';
  const endTag = '</script>';
  const start = str.indexOf(startTag) + startTag.length;
  const end = str.indexOf(endTag, start);
  const jsonStr = str.slice(start, end).trim();
  const manifest = JSON.parse(jsonStr);

  const testId = "be674772-e487-4a9f-abfb-ebd51c8d8430"; // Beranda Publik
  const item = manifest[testId];
  const buf = Buffer.from(item.data, 'base64');
  const html = item.compressed ? zlib.gunzipSync(buf).toString('utf8') : buf.toString('utf8');

  const innerStartTag = '<script type="__bundler/manifest">';
  const innerIdx = html.indexOf(innerStartTag);
  let finalHtml = html;
  if (innerIdx !== -1) {
    const innerEnd = html.indexOf('</script>', innerIdx);
    const innerManifest = JSON.parse(html.slice(innerIdx + innerStartTag.length, innerEnd).trim());
    for (const subKey in innerManifest) {
      if (innerManifest[subKey].mime === 'text/html') {
        const subBuf = Buffer.from(innerManifest[subKey].data, 'base64');
        finalHtml = innerManifest[subKey].compressed ? zlib.gunzipSync(subBuf).toString('utf8') : subBuf.toString('utf8');
        break;
      }
    }
  }

  fs.writeFileSync('sample_beranda.html', finalHtml, 'utf8');
  fs.writeFileSync('sample_report.txt', 'Length: ' + finalHtml.length + '\nPrefix:\n' + finalHtml.slice(0, 500));
} catch (e) {
  fs.writeFileSync('sample_report.txt', 'Error: ' + e.stack);
}

