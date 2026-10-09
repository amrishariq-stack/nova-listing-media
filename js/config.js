/* ============================================================
   NoVA Listing Media — site settings
   The Web3Forms access key connects the booking and contact
   forms to the inbox below. While accessKey is empty, the forms
   fall back to opening the visitor's own email app.
   ============================================================ */
window.NOVA_FORMS = {
  accessKey: "ca330688-6be1-49ff-979e-cc9f51577948",
  inbox: "info@novalistingmedia.com",
  endpoint: "https://api.web3forms.com/submit",

  /* Sends as ordinary form data, the plainest kind of request,
     so the browser needs no permission check before posting. */
  send: function (fields) {
    var data = new FormData();
    Object.keys(fields).forEach(function (k) { data.append(k, fields[k]); });
    data.append("access_key", this.accessKey);
    return fetch(this.endpoint, { method: "POST", headers: { "Accept": "application/json" }, body: data })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (!json.success) throw new Error(json.message || "Not sent");
        return json;
      });
  }
};
