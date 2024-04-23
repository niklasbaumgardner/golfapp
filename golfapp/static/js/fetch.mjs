/**
 * Sends a get request and returns the response
 * @param {String} url A string of the url to send the request to
 * @param {Object} params An object of the parameters for the request
 */
export async function getRequest(url, params = {}) {
  return fetch(url + "?" + new URLSearchParams(params));
}

export async function postRequest(url, formData) {
  return fetch(url, {
    method: "POST",
    body: formData,
  });
}

export async function deleteRequest(url) {
  return fetch(url, {
    method: "DELETE",
  });
}
