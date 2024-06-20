"use strict";

/**
 * Sends a get request and returns the response
 * @param {String} url A string of the url to send the request to
 * @param {Object} params An object of the parameters for the request
 */
async function getRequest(url, params = {}) {
  let response = await fetch(url + "?" + new URLSearchParams(params));
  response = await response.json();
  return response;
}

async function postRequest(url, formData) {
  let response = await fetch(url, {
    method: "POST",
    body: formData,
  });
  response = await response.json();
  return response;
}

async function deleteRequest(url, formData) {
  let response = await fetch(url, {
    method: "DELETE",
    body: formData,
  });
  response = await response.json();
  return response;
}
