/* ======================= PUBLIC PAGE OUTSIDE GOOGLE (elv-rooms.pages.dev) ======================= */
/** The public page hosted outside Google reads the rooms with ?p=json (doGet) and sends the
 *  room requests here, as a POST with a JSON body: {"action":"request","form":{...}}. */
function doPost(e) {
  let res;
  try {
    const o = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (o.action === 'request') res = submitRequest(o.form || {});
    else res = { ok: false, error: 'Unknown action.' };
  } catch (err) {
    res = { ok: false, error: 'Something went wrong. Please try again or contact us on WhatsApp ' + CFG.WHATSAPP + '.' };
  }
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}
