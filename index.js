addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


class ElementHandler {

  // constructor(content) {
  //   this.content = content;
  // }

  element(element) {
    // console.log(`Incoming element: ${element.tagName}`);
    element.prepend("Priyesh: ");
    if(element.hasAttribute('href')) {
      element.setAttribute('href', 'http://priyeshpatel.me/');
      element.setInnerContent('Visit my website at priyeshpatel.me');
    }
    // element.setInnerContent(this.content);
  }
}

// Reference: https://stackoverflow.com/a/15724300
function getCookie(cookie, name) {
  var value = "; " + cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}


/**
 * Respond with HTML document worker
 * @param {Request} request
 */
async function handleRequest(request) {
  let cookie = request.headers.get('Cookie'); // read the cookie from the headers.
  //if the cookie read is not null (follow up request)
  //read the variant url
  let variant_url = '';
  if(cookie) {
    variant_url = getCookie(cookie, 'variant');
  }
  else {
    let selected_variant = Math.round(Math.random()); // select a random variant from 0 or 1 with uniform probability
    let res = await fetch('https://cfw-takehome.developers.workers.dev/api/variants');
    let variant_obj = await res.json();
    variant_url = variant_obj.variants[selected_variant];
  }
  
  // console.log(variant_obj.variants[0]);
  
  let result = await fetch(variant_url);

  let custom_page = new HTMLRewriter()
    .on('title, h1#title, p#description, a#url', new ElementHandler())
    .transform(result);

  const reply = await custom_page.text();

  return new Response(reply, {
    headers: { 'content-type': 'text/html', 'Set-Cookie': [`variant=${variant_url}`] },
  })
}
