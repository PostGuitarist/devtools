export type HttpStatusCategoryId = "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

export interface HttpStatusCategory {
  id: HttpStatusCategoryId;
  name: string;
  description: string;
}

export interface HttpStatus {
  code: number;
  name: string;
  category: HttpStatusCategoryId;
  description: string;
  /** Defining document, or the vendor that introduced a non-standard code. */
  spec: string;
  /** True for codes that aren't registered with IANA. */
  unofficial?: boolean;
  deprecated?: boolean;
}

export const httpStatusCategories: HttpStatusCategory[] = [
  { id: "1xx", name: "Informational", description: "The request was received; the process continues." },
  { id: "2xx", name: "Success", description: "The request was received, understood, and accepted." },
  { id: "3xx", name: "Redirection", description: "Further action is needed to complete the request." },
  { id: "4xx", name: "Client error", description: "The request is malformed or cannot be fulfilled." },
  { id: "5xx", name: "Server error", description: "The server failed to fulfil a valid request." },
];

const RFC9110 = "RFC 9110";

const STATUSES: HttpStatus[] = [
  {
    code: 100,
    name: "Continue",
    category: "1xx",
    description:
      "The client should continue sending the request body. Sent in response to an Expect: 100-continue header.",
    spec: RFC9110,
  },
  {
    code: 101,
    name: "Switching Protocols",
    category: "1xx",
    description: "The server is switching protocols as requested by the client's Upgrade header — a WebSocket handshake, for example.",
    spec: RFC9110,
  },
  {
    code: 102,
    name: "Processing",
    category: "1xx",
    description: "The server accepted the request but hasn't finished it. Used by WebDAV to keep long operations from timing out.",
    spec: "RFC 2518",
  },
  {
    code: 103,
    name: "Early Hints",
    category: "1xx",
    description: "Preliminary response carrying Link headers so the client can preload resources while the final response is prepared.",
    spec: "RFC 8297",
  },
  {
    code: 200,
    name: "OK",
    category: "2xx",
    description: "The request succeeded. The meaning of the body depends on the method — GET returns the resource, POST returns the result of the action.",
    spec: RFC9110,
  },
  {
    code: 201,
    name: "Created",
    category: "2xx",
    description: "The request succeeded and created a new resource. The Location header should point to it.",
    spec: RFC9110,
  },
  {
    code: 202,
    name: "Accepted",
    category: "2xx",
    description: "The request was accepted for processing but hasn't completed. Typical for queued or asynchronous work.",
    spec: RFC9110,
  },
  {
    code: 203,
    name: "Non-Authoritative Information",
    category: "2xx",
    description: "The response is a modified version of the origin's payload, usually rewritten by a proxy.",
    spec: RFC9110,
  },
  {
    code: 204,
    name: "No Content",
    category: "2xx",
    description: "The request succeeded and there is no body to return. Common for DELETE and for PUT updates.",
    spec: RFC9110,
  },
  {
    code: 205,
    name: "Reset Content",
    category: "2xx",
    description: "The request succeeded; the client should reset the document view — clear the form that sent the request.",
    spec: RFC9110,
  },
  {
    code: 206,
    name: "Partial Content",
    category: "2xx",
    description: "The server is delivering part of the resource in response to a Range header. Used for resumable downloads and media seeking.",
    spec: RFC9110,
  },
  {
    code: 207,
    name: "Multi-Status",
    category: "2xx",
    description: "The body is an XML document with separate status codes for multiple independent operations (WebDAV).",
    spec: "RFC 4918",
  },
  {
    code: 208,
    name: "Already Reported",
    category: "2xx",
    description: "Members of a WebDAV binding were already enumerated in a previous part of the multi-status response.",
    spec: "RFC 5842",
  },
  {
    code: 226,
    name: "IM Used",
    category: "2xx",
    description: "The server fulfilled a GET and the response is the result of instance manipulations applied to the current instance.",
    spec: "RFC 3229",
  },
  {
    code: 300,
    name: "Multiple Choices",
    category: "3xx",
    description: "The request has more than one possible response; the client or user should pick one.",
    spec: RFC9110,
  },
  {
    code: 301,
    name: "Moved Permanently",
    category: "3xx",
    description: "The resource has a new permanent URL in the Location header. Clients and search engines should update their links.",
    spec: RFC9110,
  },
  {
    code: 302,
    name: "Found",
    category: "3xx",
    description: "The resource is temporarily at a different URL. Clients historically switch POST to GET — use 307 to avoid that.",
    spec: RFC9110,
  },
  {
    code: 303,
    name: "See Other",
    category: "3xx",
    description: "Fetch the resource at the Location URL with GET. The usual redirect after a successful POST.",
    spec: RFC9110,
  },
  {
    code: 304,
    name: "Not Modified",
    category: "3xx",
    description: "The cached copy is still fresh, so no body is sent. Returned for conditional requests using If-None-Match or If-Modified-Since.",
    spec: RFC9110,
  },
  {
    code: 305,
    name: "Use Proxy",
    category: "3xx",
    description: "The resource must be accessed through a proxy. Deprecated for security reasons and no longer honoured by browsers.",
    spec: RFC9110,
    deprecated: true,
  },
  {
    code: 307,
    name: "Temporary Redirect",
    category: "3xx",
    description: "Same as 302, but the method and body must not be changed when the request is repeated at the new URL.",
    spec: RFC9110,
  },
  {
    code: 308,
    name: "Permanent Redirect",
    category: "3xx",
    description: "Same as 301, but the method and body must not be changed when the request is repeated at the new URL.",
    spec: "RFC 9110",
  },
  {
    code: 400,
    name: "Bad Request",
    category: "4xx",
    description: "The server can't parse the request — malformed syntax, invalid framing, or deceptive routing.",
    spec: RFC9110,
  },
  {
    code: 401,
    name: "Unauthorized",
    category: "4xx",
    description: "Authentication is required or failed. Despite the name it means unauthenticated; the response carries a WWW-Authenticate header.",
    spec: RFC9110,
  },
  {
    code: 402,
    name: "Payment Required",
    category: "4xx",
    description: "Reserved for future use. Some APIs return it when a plan limit is hit or a subscription lapsed.",
    spec: RFC9110,
  },
  {
    code: 403,
    name: "Forbidden",
    category: "4xx",
    description: "The server understood the request but refuses it. Re-authenticating won't help — unlike 401.",
    spec: RFC9110,
  },
  {
    code: 404,
    name: "Not Found",
    category: "4xx",
    description: "The server has no resource at this URL and won't say whether it ever did.",
    spec: RFC9110,
  },
  {
    code: 405,
    name: "Method Not Allowed",
    category: "4xx",
    description: "The resource exists but doesn't support this method. The response must list supported methods in Allow.",
    spec: RFC9110,
  },
  {
    code: 406,
    name: "Not Acceptable",
    category: "4xx",
    description: "No representation matches the request's Accept, Accept-Language, or Accept-Encoding headers.",
    spec: RFC9110,
  },
  {
    code: 407,
    name: "Proxy Authentication Required",
    category: "4xx",
    description: "Like 401, but the client must authenticate with the proxy identified in Proxy-Authenticate.",
    spec: RFC9110,
  },
  {
    code: 408,
    name: "Request Timeout",
    category: "4xx",
    description: "The server closed an idle connection because the client took too long to send the request.",
    spec: RFC9110,
  },
  {
    code: 409,
    name: "Conflict",
    category: "4xx",
    description: "The request conflicts with the current state of the resource — a concurrent edit or a duplicate unique value.",
    spec: RFC9110,
  },
  {
    code: 410,
    name: "Gone",
    category: "4xx",
    description: "The resource was deliberately removed and won't come back. A permanent, intentional 404.",
    spec: RFC9110,
  },
  {
    code: 411,
    name: "Length Required",
    category: "4xx",
    description: "The server refuses the request because it has no Content-Length header.",
    spec: RFC9110,
  },
  {
    code: 412,
    name: "Precondition Failed",
    category: "4xx",
    description: "A conditional header such as If-Match or If-Unmodified-Since evaluated to false. The usual optimistic-locking failure.",
    spec: RFC9110,
  },
  {
    code: 413,
    name: "Content Too Large",
    category: "4xx",
    description: "The request body exceeds the server's limit. Previously called Payload Too Large.",
    spec: RFC9110,
  },
  {
    code: 414,
    name: "URI Too Long",
    category: "4xx",
    description: "The request target is longer than the server will interpret — often a GET that should have been a POST.",
    spec: RFC9110,
  },
  {
    code: 415,
    name: "Unsupported Media Type",
    category: "4xx",
    description: "The body's Content-Type isn't supported by the target resource.",
    spec: RFC9110,
  },
  {
    code: 416,
    name: "Range Not Satisfiable",
    category: "4xx",
    description: "The requested Range lies outside the size of the resource.",
    spec: RFC9110,
  },
  {
    code: 417,
    name: "Expectation Failed",
    category: "4xx",
    description: "The expectation in the Expect header can't be met by the server.",
    spec: RFC9110,
  },
  {
    code: 418,
    name: "I'm a teapot",
    category: "4xx",
    description: "An April Fools' joke from the Hyper Text Coffee Pot Control Protocol. Some servers return it for automated or unwanted traffic.",
    spec: "RFC 2324",
  },
  {
    code: 421,
    name: "Misdirected Request",
    category: "4xx",
    description: "The request reached a server that can't produce a response for this authority — a connection-reuse mismatch under HTTP/2.",
    spec: RFC9110,
  },
  {
    code: 422,
    name: "Unprocessable Content",
    category: "4xx",
    description: "The syntax is valid but the content is semantically wrong. The standard validation-failure code for JSON APIs.",
    spec: RFC9110,
  },
  {
    code: 423,
    name: "Locked",
    category: "4xx",
    description: "The resource is locked (WebDAV).",
    spec: "RFC 4918",
  },
  {
    code: 424,
    name: "Failed Dependency",
    category: "4xx",
    description: "The request failed because a request it depended on failed (WebDAV).",
    spec: "RFC 4918",
  },
  {
    code: 425,
    name: "Too Early",
    category: "4xx",
    description: "The server won't process a request sent in TLS early data, to avoid replay attacks.",
    spec: "RFC 8470",
  },
  {
    code: 426,
    name: "Upgrade Required",
    category: "4xx",
    description: "The client must switch to a different protocol, listed in the Upgrade header.",
    spec: RFC9110,
  },
  {
    code: 428,
    name: "Precondition Required",
    category: "4xx",
    description: "The server requires a conditional request so concurrent updates can't silently overwrite each other.",
    spec: "RFC 6585",
  },
  {
    code: 429,
    name: "Too Many Requests",
    category: "4xx",
    description: "The client is rate limited. A Retry-After header says when to try again.",
    spec: "RFC 6585",
  },
  {
    code: 431,
    name: "Request Header Fields Too Large",
    category: "4xx",
    description: "The headers are too large in total, or one header is — often an oversized cookie.",
    spec: "RFC 6585",
  },
  {
    code: 451,
    name: "Unavailable For Legal Reasons",
    category: "4xx",
    description: "Access is denied for legal reasons such as a takedown order or geo-blocking. The number nods to Fahrenheit 451.",
    spec: "RFC 7725",
  },
  {
    code: 500,
    name: "Internal Server Error",
    category: "5xx",
    description: "An unhandled error on the server. The generic catch-all when nothing more specific applies.",
    spec: RFC9110,
  },
  {
    code: 501,
    name: "Not Implemented",
    category: "5xx",
    description: "The server doesn't support the functionality needed — an unrecognised method, for example.",
    spec: RFC9110,
  },
  {
    code: 502,
    name: "Bad Gateway",
    category: "5xx",
    description: "A gateway or proxy got an invalid response from the upstream server it was talking to.",
    spec: RFC9110,
  },
  {
    code: 503,
    name: "Service Unavailable",
    category: "5xx",
    description: "The server is overloaded or down for maintenance. Should be temporary and may include Retry-After.",
    spec: RFC9110,
  },
  {
    code: 504,
    name: "Gateway Timeout",
    category: "5xx",
    description: "A gateway or proxy didn't get a response from the upstream server in time.",
    spec: RFC9110,
  },
  {
    code: 505,
    name: "HTTP Version Not Supported",
    category: "5xx",
    description: "The HTTP version used in the request isn't supported by the server.",
    spec: RFC9110,
  },
  {
    code: 506,
    name: "Variant Also Negotiates",
    category: "5xx",
    description: "Content negotiation is misconfigured: the chosen variant is itself a negotiating resource.",
    spec: "RFC 2295",
  },
  {
    code: 507,
    name: "Insufficient Storage",
    category: "5xx",
    description: "The server can't store the representation needed to complete the request (WebDAV).",
    spec: "RFC 4918",
  },
  {
    code: 508,
    name: "Loop Detected",
    category: "5xx",
    description: "The server aborted the operation because it found an infinite loop while processing it (WebDAV).",
    spec: "RFC 5842",
  },
  {
    code: 510,
    name: "Not Extended",
    category: "5xx",
    description: "Further extensions to the request are required for the server to fulfil it.",
    spec: "RFC 2774",
  },
  {
    code: 511,
    name: "Network Authentication Required",
    category: "5xx",
    description: "The client must authenticate to get network access — the code behind captive-portal WiFi logins.",
    spec: "RFC 6585",
  },
  {
    code: 419,
    name: "Page Expired",
    category: "4xx",
    description: "Laravel returns this when a CSRF token has expired and the form must be resubmitted.",
    spec: "Laravel",
    unofficial: true,
  },
  {
    code: 420,
    name: "Enhance Your Calm",
    category: "4xx",
    description: "Rate limiting on the retired Twitter API v1. Modern APIs use 429 instead.",
    spec: "Twitter",
    unofficial: true,
  },
  {
    code: 440,
    name: "Login Time-out",
    category: "4xx",
    description: "The session expired and the client must log in again (IIS).",
    spec: "Microsoft IIS",
    unofficial: true,
  },
  {
    code: 444,
    name: "No Response",
    category: "4xx",
    description: "nginx closes the connection without sending a response, typically to drop malicious requests.",
    spec: "nginx",
    unofficial: true,
  },
  {
    code: 494,
    name: "Request Header Too Large",
    category: "4xx",
    description: "nginx's predecessor to 431 for oversized headers.",
    spec: "nginx",
    unofficial: true,
  },
  {
    code: 499,
    name: "Client Closed Request",
    category: "4xx",
    description: "The client disconnected before nginx could respond. Usually a cancelled request or a client-side timeout.",
    spec: "nginx",
    unofficial: true,
  },
  {
    code: 520,
    name: "Web Server Returned an Unknown Error",
    category: "5xx",
    description: "Cloudflare got an empty, unknown, or malformed response from the origin server.",
    spec: "Cloudflare",
    unofficial: true,
  },
  {
    code: 521,
    name: "Web Server Is Down",
    category: "5xx",
    description: "Cloudflare could not reach the origin server — the connection was refused.",
    spec: "Cloudflare",
    unofficial: true,
  },
  {
    code: 522,
    name: "Connection Timed Out",
    category: "5xx",
    description: "Cloudflare timed out while opening a TCP connection to the origin server.",
    spec: "Cloudflare",
    unofficial: true,
  },
  {
    code: 523,
    name: "Origin Is Unreachable",
    category: "5xx",
    description: "Cloudflare cannot reach the origin — often a DNS or routing problem.",
    spec: "Cloudflare",
    unofficial: true,
  },
  {
    code: 524,
    name: "A Timeout Occurred",
    category: "5xx",
    description: "Cloudflare connected to the origin but didn't get an HTTP response before the timeout.",
    spec: "Cloudflare",
    unofficial: true,
  },
  {
    code: 525,
    name: "SSL Handshake Failed",
    category: "5xx",
    description: "The TLS handshake between Cloudflare and the origin server failed.",
    spec: "Cloudflare",
    unofficial: true,
  },
  {
    code: 526,
    name: "Invalid SSL Certificate",
    category: "5xx",
    description: "Cloudflare could not validate the origin server's TLS certificate.",
    spec: "Cloudflare",
    unofficial: true,
  },
  {
    code: 530,
    name: "Site Frozen / Origin Error",
    category: "5xx",
    description: "Cloudflare returns 530 alongside a 1xxx error code that carries the real cause.",
    spec: "Cloudflare",
    unofficial: true,
  },
  {
    code: 599,
    name: "Network Connect Timeout Error",
    category: "5xx",
    description: "Used by some proxies to signal that a network connection timed out behind the proxy.",
    spec: "Proxy convention",
    unofficial: true,
  },
];

export const httpStatuses: HttpStatus[] = [...STATUSES].sort((a, b) => a.code - b.code);

export function getHttpStatus(code: number): HttpStatus | undefined {
  return httpStatuses.find((status) => status.code === code);
}

export function getHttpStatusCategory(code: number): HttpStatusCategoryId | null {
  const hundreds = Math.floor(code / 100);
  if (hundreds < 1 || hundreds > 5) return null;
  return (`${hundreds}xx`) as HttpStatusCategoryId;
}

/** Matches on code, name, and description; an exact code match sorts first. */
export function searchHttpStatuses(query: string): HttpStatus[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === "") return httpStatuses;

  const matches = httpStatuses.filter(
    (status) =>
      String(status.code).includes(trimmed) ||
      status.name.toLowerCase().includes(trimmed) ||
      status.description.toLowerCase().includes(trimmed)
  );

  const exact = Number(trimmed);
  if (!Number.isNaN(exact)) {
    return [...matches].sort((a, b) => {
      if (a.code === exact) return -1;
      if (b.code === exact) return 1;
      return a.code - b.code;
    });
  }
  return matches;
}
